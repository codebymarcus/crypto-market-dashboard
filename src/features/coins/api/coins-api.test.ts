import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCoins } from "./coins-api";

const validCoin = {
  id: "bitcoin",
  symbol: "btc",
  name: "Bitcoin",
  image: "https://example.com/bitcoin.png",
  current_price: 60000,
  market_cap: 1_000_000,
  market_cap_rank: 1,
  price_change_percentage_24h: 2,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchCoins", () => {
  it("returns validated coin data on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([validCoin]), { status: 200 }),
      ),
    );

    await expect(fetchCoins()).resolves.toEqual([validCoin]);
  });

  it("requests the given page and page size", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([validCoin]), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchCoins({ page: 3, perPage: 20 });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/coins/markets");
    expect(url).toContain("per_page=20");
    expect(url).toContain("page=3");
  });

  it("requests specific coins by id when ids are given", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([validCoin]), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchCoins({ ids: ["bitcoin", "ethereum"] });

    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "ids=bitcoin%2Cethereum",
    );
  });

  it("accepts a coin with a null current_price", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ ...validCoin, current_price: null }]), {
          status: 200,
        }),
      ),
    );

    const coins = await fetchCoins();
    expect(coins[0].current_price).toBeNull();
  });
});
