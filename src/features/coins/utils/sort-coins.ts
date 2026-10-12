import type { Coin } from "../types";

export type SortField = "price" | "change";
export type SortDirection = "asc" | "desc";

export function sortCoins(
  coins: Coin[],
  field: SortField,
  direction: SortDirection,
): Coin[] {
  return [...coins].sort((a, b) => {
    const aValue =
      field === "price" ? a.current_price : a.price_change_percentage_24h;

    const bValue =
      field === "price" ? b.current_price : b.price_change_percentage_24h;

    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    const result = aValue - bValue;

    return direction === "asc" ? result : -result;
  });
}
