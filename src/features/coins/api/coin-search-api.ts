import { z } from "zod";
import { coinGeckoClient } from "@/lib/api-clients";

export const coinSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  market_cap_rank: z.number().nullable(),
});

const searchResponseSchema = z.object({
  coins: z.array(coinSearchResultSchema),
});

export function fetchCoinSearch(
  query: string,
  signal?: AbortSignal,
): Promise<z.infer<typeof coinSearchResultSchema>[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return Promise.resolve([]);
  }

  return coinGeckoClient
    .get("/search", {
      params: { query: trimmed },
      schema: searchResponseSchema,
      signal,
    })
    .then((data) => data.coins);
}
