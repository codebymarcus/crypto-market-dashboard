import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createApiClient } from "./api-client";

const client = createApiClient({
  baseUrl: "https://api.test/v3",
  source: "test",
  label: "Test",
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createApiClient().get", () => {
  it("parses and returns data matching the schema", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "x" }), { status: 200 }),
      ),
    );

    await expect(
      client.get("/thing", { schema: z.object({ id: z.string() }) }),
    ).resolves.toEqual({ id: "x" });
  });

  it("builds the URL from base + path + params and sends configured headers", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const keyed = createApiClient({
      baseUrl: "https://api.test/v3",
      source: "test",
      label: "Test",
      headers: { "x-cg-demo-api-key": "abc" },
    });

    await keyed.get("/coins/markets", {
      params: { vs_currency: "usd", page: 2 },
      schema: z.object({}),
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.test/v3/coins/markets?vs_currency=usd&page=2",
    );
    expect((init as RequestInit).headers).toEqual({ "x-cg-demo-api-key": "abc" });
  });

  it("omits the query string when no params are given", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await client.get("/ping", { schema: z.object({}) });

    expect(String(fetchMock.mock.calls[0][0])).toBe("https://api.test/v3/ping");
  });

  it("wraps a fetch network failure as kind network", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(
      client.get("/thing", { schema: z.unknown() }),
    ).rejects.toMatchObject({ kind: "network", source: "test" });
  });

  it("maps a 429 to a friendly http error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 429 })),
    );

    await expect(
      client.get("/thing", { schema: z.unknown() }),
    ).rejects.toMatchObject({ kind: "http", status: 429 });
  });

  it("throws kind parse on invalid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("not json", { status: 200 })),
    );

    await expect(
      client.get("/thing", { schema: z.unknown() }),
    ).rejects.toMatchObject({ kind: "parse" });
  });

  it("throws kind shape when the body fails the schema", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1 }), { status: 200 }),
      ),
    );

    await expect(
      client.get("/thing", { schema: z.object({ id: z.string() }) }),
    ).rejects.toMatchObject({ kind: "shape" });
  });

  it("throws kind timeout when the request exceeds the timeout", async () => {
    const fast = createApiClient({
      baseUrl: "https://api.test/v3",
      source: "test",
      label: "Test",
      timeoutMs: 20,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(init.signal?.reason),
            );
          }),
      ),
    );

    await expect(
      fast.get("/thing", { schema: z.unknown() }),
    ).rejects.toMatchObject({ kind: "timeout", source: "test" });
  });

  it("re-throws a caller cancellation untouched", async () => {
    const controller = new AbortController();
    const abortError = new DOMException("Aborted", "AbortError");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => reject(abortError));
          }),
      ),
    );

    const promise = client.get("/thing", {
      schema: z.unknown(),
      signal: controller.signal,
    });
    controller.abort();

    await expect(promise).rejects.toBe(abortError);
  });
});
