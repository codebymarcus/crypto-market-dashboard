import { createApiClient } from "./http/api-client";

const COINGECKO_BASE_URL =
  import.meta.env.VITE_COINGECKO_BASE_URL ?? "https://api.coingecko.com/api/v3";
const COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;

export const coinGeckoClient = createApiClient({
  baseUrl: COINGECKO_BASE_URL,
  source: "coingecko",
  label: "CoinGecko",
  headers: COINGECKO_API_KEY
    ? { "x-cg-demo-api-key": COINGECKO_API_KEY }
    : undefined,
});
