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
  markets: ({ page, perPage }: { page: number; perPage: number }) =>
    [...coinKeys.all, "market", "usd", perPage, page] as const,
  marketsByIds: (ids: string[]) =>
    [...coinKeys.all, "market", "usd", "ids", ...ids] as const,
  search: (query: string) => [...coinKeys.all, "search", query] as const,
  marketChart: (coinId: string, days: ChartPeriod) =>
    [...coinKeys.all, "market-chart", coinId, days] as const,
};
