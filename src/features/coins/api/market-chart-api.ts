import { z } from "zod";
import { coinGeckoClient } from "@/lib/api-clients";
import { ApiError } from "@/lib/http/api-error";
import type { ChartPeriod } from "../types";

const pointSchema = z
  .tuple([z.number(), z.number()])
  .refine(
    ([timestamp, value]) =>
      Number.isFinite(timestamp) && Number.isFinite(value),
  );

export const marketChartSchema = z.object({
  prices: z.array(pointSchema),
});

export function fetchMarketChart(
  coinId: string,
  days: ChartPeriod,
  signal?: AbortSignal,
): Promise<z.infer<typeof marketChartSchema>> {
  if (!coinId.trim()) {
    return Promise.reject(
      new ApiError("A coin ID is required.", {
        kind: "shape",
        source: "coingecko",
      }),
    );
  }

  return coinGeckoClient.get(
    `/coins/${encodeURIComponent(coinId)}/market_chart`,
    { params: { vs_currency: "usd", days }, schema: marketChartSchema, signal },
  );
}
