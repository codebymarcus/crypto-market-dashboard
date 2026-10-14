import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchMarketChart } from "../api/market-chart-api";
import type { ChartPeriod } from "../types";
import { retryApiQuery } from "@/lib/query-retry";
import { coinKeys } from "./coin-keys";

export function useMarketChart(coinId: string, days: ChartPeriod) {
  return useQuery({
    queryKey: coinKeys.marketChart(coinId, days),
    queryFn: ({ signal }) => fetchMarketChart(coinId, days, signal),
    enabled: Boolean(coinId),
    placeholderData: keepPreviousData,
    retry: retryApiQuery,
  });
}
