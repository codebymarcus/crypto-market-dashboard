import type { z } from "zod";
import type { coinSchema } from "./api/coins-api";
import type { coinSearchResultSchema } from "./api/coin-search-api";

export type Coin = z.infer<typeof coinSchema>;

export type CoinSearchResult = z.infer<typeof coinSearchResultSchema>;

export type ChartPeriod = 1 | 7 | 30;
export type HistoricalDataPoint = [timestamp: number, value: number];

export interface MarketChart {
  prices: HistoricalDataPoint[];
  market_caps: HistoricalDataPoint[];
  total_volumes: HistoricalDataPoint[];
}
