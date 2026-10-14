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
});
