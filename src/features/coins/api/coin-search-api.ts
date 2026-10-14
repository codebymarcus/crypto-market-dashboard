import type { CoinSearchResult } from "../types";
import { ApiError } from "@/lib/api-error";
import { isAbortError } from "@/lib/is-abort-error";

const SEARCH_API_URL = "https://api.coingecko.com/api/v3/search";

export class CoinSearchApiError extends ApiError {
  public override readonly name = "CoinSearchApiError";
}

function isNullableNumber(value: unknown): boolean {
  return value === null || typeof value === "number";
}

function isCoinSearchResult(value: unknown): value is CoinSearchResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const result = value as Record<string, unknown>;

  return (
    typeof result.id === "string" &&
    typeof result.name === "string" &&
    typeof result.symbol === "string" &&
    isNullableNumber(result.market_cap_rank)
  );
}

export async function fetchCoinSearch(
  query: string,
  signal?: AbortSignal,
): Promise<CoinSearchResult[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const params = new URLSearchParams({ query: trimmed });

  let response: Response;

  try {
    response = await fetch(`${SEARCH_API_URL}?${params}`, { signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new CoinSearchApiError(
      "Couldn't reach CoinGecko - you may be rate-limited or offline. Please wait a moment and try again.",
    );
  }

  if (!response.ok) {
    const message =
      response.status === 429
        ? "CoinGecko rate limit reached. Please try again shortly."
        : `CoinGecko search failed with status ${response.status}.`;

    throw new CoinSearchApiError(message, response.status);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new CoinSearchApiError(
      "CoinGecko returned an invalid JSON response.",
      response.status,
    );
  }

  const coins = (data as { coins?: unknown } | null)?.coins;

  if (!Array.isArray(coins) || !coins.every(isCoinSearchResult)) {
    throw new CoinSearchApiError(
      "CoinGecko returned data in unexpected format.",
      response.status,
    );
  }

  return coins.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    market_cap_rank: coin.market_cap_rank,
  }));
}
