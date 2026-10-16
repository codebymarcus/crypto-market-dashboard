import { z } from "zod";
import { coinGeckoClient } from "@/lib/api-clients";

export const coinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  current_price: z.number().nullable(),
  market_cap: z.number().nullable(),
  market_cap_rank: z.number().nullable(),
  price_change_percentage_24h: z.number().nullable(),
});

const coinsSchema = z.array(coinSchema);

type FetchCoinsOptions = {
  page?: number;
  perPage?: number;
  ids?: string[];
};

export function fetchCoins(
  options: FetchCoinsOptions = {},
  signal?: AbortSignal,
): Promise<z.infer<typeof coinsSchema>> {
  const { page = 1, perPage = 20, ids } = options;

  const params: Record<string, string | number | boolean> =
    ids && ids.length > 0
      ? {
          vs_currency: "usd",
          order: "market_cap_desc",
          sparkline: false,
          ids: ids.join(","),
          per_page: ids.length,
          page: 1,
        }
      : {
          vs_currency: "usd",
          order: "market_cap_desc",
          sparkline: false,
          per_page: perPage,
          page,
        };

  return coinGeckoClient.get("/coins/markets", {
    params,
    schema: coinsSchema,
    signal,
  });
}
