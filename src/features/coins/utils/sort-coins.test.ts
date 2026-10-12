import { describe, expect, it } from "vitest";
import type { Coin } from "../types";
import { sortCoins } from "./sort-coins";

const coins: Coin[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "btc",
    image: "",
    current_price: 60000,
    market_cap: 1000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "eth",
    image: "",
    current_price: 3000,
    market_cap: 500000,
    market_cap_rank: 2,
    price_change_percentage_24h: -1,
  },
  {
    id: "test-coin",
    name: "Test Coin",
    symbol: "test",
    image: "",
    current_price: 10,
    market_cap: 1000,
    market_cap_rank: 3,
    price_change_percentage_24h: null,
  },
];

describe("sortCoins", () => {
  it("sorts by price descending", () => {
    const result = sortCoins(coins, "price", "desc");

    expect(result.map((coin) => coin.id)).toEqual([
      "bitcoin",
      "ethereum",
      "test-coin",
    ]);
  });

  it("sorts by 24-hour change ascending", () => {
    const result = sortCoins(coins, "change", "asc");

    expect(result.map((coin) => coin.id)).toEqual([
      "ethereum",
      "bitcoin",
      "test-coin",
    ]);
  });

  it("does not mutate the original array", () => {
    const originalIds = coins.map((coin) => coin.id);

    sortCoins(coins, "price", "asc");

    expect(coins.map((coin) => coin.id)).toEqual(originalIds);
  });
});
