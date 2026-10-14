import type { Coin } from "../types";
import { isAbortError } from "@/lib/is-abort-error";

const COINS_API_URL = "https://api.coingecko.com/api/v3/coins/markets";

const COINS_API_PARAMS = new URLSearchParams({
  vs_currency: "usd",
  order: "market_cap_desc",
  per_page: "20",
  page: "1",
  sparkline: "false",
});

export class CoinsApiError extends Error {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
    this.name = "CoinsApiError";
  }
}

function isNullableNumber(value: unknown): boolean {
  return value === null || typeof value === "number";
}

function isCoin(value: unknown): value is Coin {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const coin = value as Record<string, unknown>;

  return (
    typeof coin.id === "string" &&
    typeof coin.symbol === "string" &&
    typeof coin.name === "string" &&
    typeof coin.image === "string" &&
    isNullableNumber(coin.current_price) &&
    isNullableNumber(coin.market_cap) &&
    isNullableNumber(coin.market_cap_rank) &&
    isNullableNumber(coin.price_change_percentage_24h)
  );
}

export async function fetchCoins(signal?: AbortSignal): Promise<Coin[]> {
  const url = `${COINS_API_URL}?${COINS_API_PARAMS}`;

  let response: Response;

  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new CoinsApiError(
      "Unable to connect to CoinGecko. Check your network connection.",
    );
  }

  if (!response.ok) {
    const message =
      response.status === 429
        ? "CoinGecko rate limit reached. Please try again shortly."
        : `CoinGecko request failed with status ${response.status}.`;

    throw new CoinsApiError(message, response.status);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new CoinsApiError(
      "CoinGecko returned an invalid JSON response.",
      response.status,
    );
  }

  if (!Array.isArray(data) || !data.every(isCoin)) {
    throw new CoinsApiError(
      "CoinGecko returned data in unexpected format.",
      response.status,
    );
  }

  return data;
}
