import type { z } from "zod";
import type { coinSchema } from "./api/coins-api";

export type Coin = z.infer<typeof coinSchema>;

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
}

export type ChartPeriod = 1 | 7 | 30;
export type HistoricalDataPoint = [timestamp: number, value: number];

export interface MarketChart {
  prices: HistoricalDataPoint[];
  market_caps: HistoricalDataPoint[];
  total_volumes: HistoricalDataPoint[];
}
