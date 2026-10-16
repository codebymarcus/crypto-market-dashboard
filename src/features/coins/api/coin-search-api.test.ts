import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCoinSearch } from "./coin-search-api";

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
  it("returns results and strips unknown wire fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(searchResponse), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchCoinSearch("bitcoin");

    expect(result).toEqual([
      { id: "bitcoin", name: "Bitcoin", symbol: "BTC", market_cap_rank: 1 },
    ]);
    expect(result[0]).not.toHaveProperty("thumb");

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
});
