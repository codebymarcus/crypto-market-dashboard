import { describe, expect, it } from "vitest";
import { coinKeys } from "./coin-keys";

describe("coinKeys", () => {
  it("builds a paginated markets key", () => {
    expect(coinKeys.markets({ page: 2, perPage: 20 })).toEqual([
      "coins",
      "market",
      "usd",
      20,
      2,
    ]);
  });

  it("builds a markets-by-ids key", () => {
    expect(coinKeys.marketsByIds(["bitcoin", "ethereum"])).toEqual([
      "coins",
      "market",
      "usd",
      "ids",
      "bitcoin",
      "ethereum",
    ]);
  });

  it("builds a search key", () => {
    expect(coinKeys.search("eth")).toEqual(["coins", "search", "eth"]);
  });
});
