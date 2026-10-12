import type { Coin } from "../types";

export const mockCoins: Coin[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "btc",
    image: "https://example.com/bitcoin.png",
    current_price: 60000,
    market_cap: 1_000_000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "eth",
    image: "https://example.com/ethereum.png",
    current_price: 3000,
    market_cap: 500_000,
    market_cap_rank: 2,
    price_change_percentage_24h: -1,
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "sol",
    image: "https://example.com/solana.png",
    current_price: 150,
    market_cap: 100_000,
    market_cap_rank: 3,
    price_change_percentage_24h: 5,
  },
];
