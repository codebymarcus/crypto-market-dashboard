export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number | null;
}

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
