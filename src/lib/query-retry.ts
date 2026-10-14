import { ApiError } from "./api-error";

/**
 * Shared React Query `retry` predicate.
 *
 * - A statusless ApiError means `fetch` itself threw — a network or CORS
 *   failure (e.g. a rate-limited 429 that Cloudflare returns without CORS
 *   headers, which the browser blocks). Retrying can't help and only adds
 *   more requests while rate-limited, so we don't retry it.
 * - A 4xx retries only the transient 408/429, and only once.
 * - Anything else (5xx, or an unexpected non-ApiError) retries up to twice.
 */
export function retryApiQuery(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError) {
    if (error.status === undefined) {
      return false;
    }

    if (error.status >= 400 && error.status < 500) {
      return (error.status === 408 || error.status === 429) && failureCount < 1;
    }
  }

  return failureCount < 2;
}
