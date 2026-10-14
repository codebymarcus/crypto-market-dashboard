import { afterEach, describe, expect, it, vi } from "vitest";
import { CoinSearchApiError, fetchCoinSearch } from "./coin-search-api";

const searchResponse = {
  coins: [
    {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      market_cap_rank: 1,
      thumb: "https://example.com/thumb.png",
    },
  ],
  exchanges: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchCoinSearch", () => {
  it("returns validated coin search results", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(searchResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchCoinSearch("bitcoin");

    expect(result).toEqual([
      { id: "bitcoin", name: "Bitcoin", symbol: "BTC", market_cap_rank: 1 },
    ]);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/search");
    expect(url).toContain("query=bitcoin");
  });

  it("returns an empty array for a blank query without fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchCoinSearch("   ")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("passes the abort signal to fetch", async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(searchResponse), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchCoinSearch("bitcoin", controller.signal);

    expect(fetchMock.mock.calls[0][1]).toEqual({ signal: controller.signal });
  });

  it("preserves request cancellation errors", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    await expect(fetchCoinSearch("bitcoin")).rejects.toBe(abortError);
  });

  it("throws a specific error for HTTP 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 429 })),
    );

    await expect(fetchCoinSearch("bitcoin")).rejects.toMatchObject({
      name: "CoinSearchApiError",
      status: 429,
    });
  });

  it("rejects an unexpected response shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ coins: [{ id: 1 }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(fetchCoinSearch("bitcoin")).rejects.toBeInstanceOf(
      CoinSearchApiError,
    );
  });
});
