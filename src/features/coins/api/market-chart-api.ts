import type { ChartPeriod, HistoricalDataPoint, MarketChart } from "../types";
import { ApiError } from "@/lib/api-error";
import { isAbortError } from "@/lib/is-abort-error";

const API_BASE_URL = "https://api.coingecko.com/api/v3";

export class MarketChartApiError extends ApiError {
  public override readonly name = "MarketChartApiError";
}

function isDataPoint(value: unknown): value is HistoricalDataPoint {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    Number.isFinite(value[0]) &&
    typeof value[1] === "number" &&
    Number.isFinite(value[1])
  );
}

function isMarketChart(value: unknown): value is MarketChart {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const chart = value as Record<string, unknown>;

  return (
    Array.isArray(chart.prices) &&
    chart.prices.every(isDataPoint) &&
    Array.isArray(chart.market_caps) &&
    chart.market_caps.every(isDataPoint) &&
    Array.isArray(chart.total_volumes) &&
    chart.total_volumes.every(isDataPoint)
  );
}

export async function fetchMarketChart(
  coinId: string,
  days: ChartPeriod,
  signal?: AbortSignal,
): Promise<MarketChart> {
  if (!coinId.trim()) {
    throw new MarketChartApiError("A coin ID is required.");
  }

  const params = new URLSearchParams({
    vs_currency: "usd",
    days: String(days),
  });

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/coins/${encodeURIComponent(coinId)}/market_chart?${params}`,
      { signal },
    );
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new MarketChartApiError(
      "Unable to connect to the market data service.",
    );
  }

  if (!response.ok) {
    const message =
      response.status === 429
        ? "Market data rate limit reached. Please try again shortly."
        : `Unable to fetch market chart (HTTP ${response.status}).`;

    throw new MarketChartApiError(message, response.status);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new MarketChartApiError(
      "The market data service returned invalid JSON.",
    );
  }

  if (!isMarketChart(payload)) {
    throw new MarketChartApiError(
      "The market data service returned an unexpected response.",
    );
  }

  return payload;
}
