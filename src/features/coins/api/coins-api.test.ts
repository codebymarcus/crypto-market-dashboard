import { afterEach, describe, expect, it, vi } from "vitest";
import { CoinsApiError, fetchCoins } from "./coins-api";

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
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([validCoin]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchCoins()).resolves.toEqual([validCoin]);
  });

  it("requests the given page and page size", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([validCoin]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchCoins({ page: 3, perPage: 20 });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("vs_currency=usd");
    expect(url).toContain("order=market_cap_desc");
    expect(url).toContain("per_page=20");
    expect(url).toContain("page=3");
  });

  it("requests specific coins by id when ids are given", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([validCoin]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchCoins({ ids: ["bitcoin", "ethereum"] });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("ids=bitcoin%2Cethereum");
  });

  it("passes the abort signal to fetch", async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([validCoin]), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchCoins({ page: 1 }, controller.signal);

    expect(fetchMock.mock.calls[0][1]).toEqual({ signal: controller.signal });
  });

  it("preserves request cancellation errors", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    await expect(fetchCoins()).rejects.toBe(abortError);
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

    await expect(fetchCoins()).rejects.toThrow("Unable to connect to CoinGecko.");
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
