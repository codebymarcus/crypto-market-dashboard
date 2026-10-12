import { afterEach, describe, expect, it, vi } from "vitest";
import { CoinsApiError, fetchCoins } from "./coins-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchCoins", () => {
  it("returns validated coin data on success", async () => {
    const response = [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://example.com/bitcoin.png",
        current_price: 60000,
        market_cap: 1_000_000,
        market_cap_rank: 1,
        price_change_percentage_24h: 2,
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(response), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(fetchCoins()).resolves.toEqual(response);
  });

  it("throws a specific error for HTTP 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 429 })),
    );

    await expect(fetchCoins()).rejects.toMatchObject({
      name: "CoinsApiError",
      status: 429,
      message: "CoinGecko rate limit reached. Please try again shortly.",
    });
  });

  it("throws an error when the network request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(fetchCoins()).rejects.toThrow(
      "Unable to connect to CoinGecko.",
    );
  });

  it("rejects unexpected API response data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ id: "bitcoin" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(fetchCoins()).rejects.toBeInstanceOf(CoinsApiError);
  });
});
