import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMarketChart } from "./market-chart-api";
import { ApiError } from "@/lib/http/api-error";

const prices = [
  [1_791_849_600_000, 62_450.12],
  [1_791_853_200_000, 62_610.45],
];
const wireResponse = {
  prices,
  market_caps: [[1_791_849_600_000, 1_200_000_000_000]],
  total_volumes: [[1_791_849_600_000, 25_000_000_000]],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchMarketChart", () => {
  it("returns only prices and drops the unused arrays", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(wireResponse), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchMarketChart("bitcoin", 7);

    expect(result).toEqual({ prices });
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/coins/bitcoin/market_chart");
    expect(url).toContain("vs_currency=usd");
    expect(url).toContain("days=7");
  });

  it("rejects an empty coin ID without making a request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchMarketChart("  ", 7)).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
