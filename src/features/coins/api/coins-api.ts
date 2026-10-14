import type { Coin } from "../types";
import { ApiError } from "@/lib/api-error";
import { isAbortError } from "@/lib/is-abort-error";

const COINS_API_URL = "https://api.coingecko.com/api/v3/coins/markets";

export class CoinsApiError extends ApiError {
  public override readonly name = "CoinsApiError";
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

type FetchCoinsOptions = {
  page?: number;
  perPage?: number;
  ids?: string[];
};

export async function fetchCoins(
  options: FetchCoinsOptions = {},
  signal?: AbortSignal,
): Promise<Coin[]> {
  const { page = 1, perPage = 20, ids } = options;

  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    sparkline: "false",
  });

  if (ids && ids.length > 0) {
    params.set("ids", ids.join(","));
    params.set("per_page", String(ids.length));
    params.set("page", "1");
  } else {
    params.set("per_page", String(perPage));
    params.set("page", String(page));
  }

  const url = `${COINS_API_URL}?${params}`;

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
