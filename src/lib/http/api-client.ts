import type { ZodType } from "zod";
import { ApiError } from "./api-error";

export type ApiClient = {
  get<T>(
    path: string,
    options: {
      params?: Record<string, string | number | boolean>;
      schema: ZodType<T>;
      signal?: AbortSignal;
    },
  ): Promise<T>;
};

export function createApiClient(config: {
  baseUrl: string;
  source: string;
  label: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}): ApiClient {
  const { baseUrl, source, label, headers, timeoutMs = 10_000 } = config;

  return {
    async get(path, { params, schema, signal }) {
      const query = params
        ? "?" +
          new URLSearchParams(
            Object.entries(params).map(([key, value]) => [key, String(value)]),
          ).toString()
        : "";
      const url = `${baseUrl}${path}${query}`;

      const timeout = AbortSignal.timeout(timeoutMs);
      const requestSignal = signal
        ? AbortSignal.any([signal, timeout])
        : timeout;

      let response: Response;
      try {
        response = await fetch(url, { headers, signal: requestSignal });
      } catch (error) {
        if (signal?.aborted) {
          throw error; // caller cancellation — keep it a cancellation
        }
        if (timeout.aborted) {
          throw new ApiError(
            `${label} took too long to respond. Please try again.`,
            { kind: "timeout", source },
          );
        }
        throw new ApiError(
          `Couldn't reach ${label} — you may be rate-limited or offline. Please wait a moment and try again.`,
          { kind: "network", source, cause: error },
        );
      }

      if (!response.ok) {
        const message =
          response.status === 429
            ? `${label} rate limit reached. Please try again shortly.`
            : `${label} request failed (HTTP ${response.status}).`;
        throw new ApiError(message, {
          kind: "http",
          source,
          status: response.status,
        });
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch (error) {
        throw new ApiError(`${label} returned an invalid response.`, {
          kind: "parse",
          source,
          cause: error,
        });
      }

      const result = schema.safeParse(data);
      if (!result.success) {
        throw new ApiError(`${label} returned data in an unexpected format.`, {
          kind: "shape",
          source,
          cause: result.error,
        });
      }

      return result.data;
    },
  };
}
