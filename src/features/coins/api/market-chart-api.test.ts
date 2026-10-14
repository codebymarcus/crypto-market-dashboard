import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMarketChart, MarketChartApiError } from "./market-chart-api";

const validResponse = {
  prices: [
    [1_791_849_600_000, 62_450.12],
    [1_791_853_200_000, 62_610.45],
  ],
  market_caps: [[1_791_849_600_000, 1_200_000_000_000]],
  total_volumes: [[1_791_849_600_000, 25_000_000_000]],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchMarketChart", () => {
  it("fetches and returns historical market data", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => validResponse,
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchMarketChart("bitcoin", 7);

    expect(result).toEqual(validResponse);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/coins/bitcoin/market_chart");
    expect(String(url)).toContain("vs_currency=usd");
    expect(String(url)).toContain("days=7");
  });

  it("passes the abort signal to fetch", async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => validResponse,
    });

    vi.stubGlobal("fetch", fetchMock);

    await fetchMarketChart("bitcoin", 1, controller.signal);

    expect(fetchMock.mock.calls[0][1]).toEqual({
      signal: controller.signal,
    });
  });

  it("throws a typed error for HTTP failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    await expect(fetchMarketChart("unknown-coin", 7)).rejects.toMatchObject({
      name: "MarketChartApiError",
      status: 404,
    });
  });

  it("throws a helpful error for invalid payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ prices: "not-an-array" }),
      }),
    );

    await expect(fetchMarketChart("bitcoin", 7)).rejects.toThrow(
      "unexpected response",
    );
  });

  it("rejects an empty coin ID without making a request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchMarketChart("  ", 7)).rejects.toBeInstanceOf(
      MarketChartApiError,
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves request cancellation errors", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    await expect(fetchMarketChart("bitcoin", 7)).rejects.toBe(abortError);
  });
});
