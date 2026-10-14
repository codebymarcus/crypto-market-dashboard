import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCoinSearch } from "./use-coin-search";

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function stubFetchFor(coins: unknown[], market: unknown[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      const body = url.includes("/search") ? { coins } : market;
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCoinSearch", () => {
  it("stays idle for a blank query", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCoinSearch("  "), {
      wrapper: createWrapper(),
    });

    expect(result.current.coins).toEqual([]);
    expect(result.current.isPending).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves search hits to market data", async () => {
    stubFetchFor(
      [{ id: "bitcoin", name: "Bitcoin", symbol: "BTC", market_cap_rank: 1 }],
      [
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
      ],
    );

    const { result } = renderHook(() => useCoinSearch("bitcoin"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.coins).toHaveLength(1));
    expect(result.current.coins[0].id).toBe("bitcoin");
    expect(result.current.isPending).toBe(false);
  });

  it("reports an empty result set without a market request", async () => {
    stubFetchFor([], []);

    const { result } = renderHook(() => useCoinSearch("zzzz"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.coins).toEqual([]);
  });

  it("reports a loading state instead of stale coins while a follow-up search loads", async () => {
    let resolveEthMarkets: (value: Response) => void = () => {};
    const ethMarketsPromise = new Promise<Response>((resolve) => {
      resolveEthMarkets = resolve;
    });

    const json = (body: unknown) =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/search")) {
          const coins = url.includes("query=ethereum")
            ? [
                {
                  id: "ethereum",
                  name: "Ethereum",
                  symbol: "ETH",
                  market_cap_rank: 2,
                },
              ]
            : [
                {
                  id: "bitcoin",
                  name: "Bitcoin",
                  symbol: "BTC",
                  market_cap_rank: 1,
                },
              ];
          return Promise.resolve(json({ coins }));
        }

        // markets endpoint — defer the follow-up (ethereum) request so we can
        // observe the window where its data is not yet available.
        if (url.includes("ethereum")) {
          return ethMarketsPromise;
        }
        return Promise.resolve(
          json([
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
          ]),
        );
      }),
    );

    const { result, rerender } = renderHook(
      ({ query }) => useCoinSearch(query),
      { wrapper: createWrapper(), initialProps: { query: "bitcoin" } },
    );

    await waitFor(() => expect(result.current.coins).toHaveLength(1));
    expect(result.current.coins[0].id).toBe("bitcoin");

    rerender({ query: "ethereum" });

    // The follow-up search's market data is still loading, so we must not keep
    // presenting the previous term's coins as a settled result.
    await waitFor(() => expect(result.current.isPending).toBe(true));

    resolveEthMarkets(
      json([
        {
          id: "ethereum",
          symbol: "eth",
          name: "Ethereum",
          image: "https://example.com/ethereum.png",
          current_price: 3000,
          market_cap: 500_000,
          market_cap_rank: 2,
          price_change_percentage_24h: 1,
        },
      ]),
    );

    await waitFor(() => expect(result.current.coins[0]?.id).toBe("ethereum"));
    expect(result.current.isPending).toBe(false);
  });

  it("clears results when a search is refined to zero matches", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        let body: unknown;
        if (url.includes("/search")) {
          body = url.includes("query=bitcoin")
            ? {
                coins: [
                  {
                    id: "bitcoin",
                    name: "Bitcoin",
                    symbol: "BTC",
                    market_cap_rank: 1,
                  },
                ],
              }
            : { coins: [] };
        } else {
          body = [
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
        }
        return Promise.resolve(
          new Response(JSON.stringify(body), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }),
    );

    const { result, rerender } = renderHook(
      ({ query }) => useCoinSearch(query),
      { wrapper: createWrapper(), initialProps: { query: "bitcoin" } },
    );

    await waitFor(() => expect(result.current.coins).toHaveLength(1));

    rerender({ query: "zzzz" });

    await waitFor(() => expect(result.current.coins).toEqual([]));
    expect(result.current.isPending).toBe(false);
  });
});
