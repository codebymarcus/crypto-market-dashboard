import type { ChartPeriod } from "../types";

/**
 * Query-key factory for the `coins` feature — the single source of truth for this
 * feature's React Query keys. Build keys through these helpers, never inline, so keys
 * stay consistent and invalidation is reliable.
 *
 * `all` is the shared prefix: `queryClient.invalidateQueries({ queryKey: coinKeys.all })`
 * invalidates every query in the feature.
 */
export const coinKeys = {
  all: ["coins"] as const,
  markets: () => [...coinKeys.all, "market", "usd", 20, 1] as const,
  marketChart: (coinId: string, days: ChartPeriod) =>
    [...coinKeys.all, "market-chart", coinId, days] as const,
};
