import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchMarketChart, MarketChartApiError } from "../api/market-chart-api";
import type { ChartPeriod } from "../types";
import { coinKeys } from "./coin-keys";

export function useMarketChart(coinId: string, days: ChartPeriod) {
  return useQuery({
    queryKey: coinKeys.marketChart(coinId, days),
    queryFn: ({ signal }) => fetchMarketChart(coinId, days, signal),
    enabled: Boolean(coinId),
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error instanceof MarketChartApiError && error.status) {
        if (error.status >= 400 && error.status < 500) {
          return (
            (error.status === 408 || error.status === 429) && failureCount < 1
          );
        }
      }

      return failureCount < 2;
    },
  });
}
