import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchCoins } from "../api/coins-api";
import { fetchCoinSearch } from "../api/coin-search-api";
import type { Coin } from "../types";
import { retryApiQuery } from "@/lib/query-retry";
import { coinKeys } from "./coin-keys";

export const SEARCH_RESULT_LIMIT = 50;

export type CoinListState = {
  coins: Coin[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  refetch: () => void;
};

export function useCoinSearch(query: string): CoinListState {
  const trimmed = query.trim();
  const enabled = trimmed.length > 0;

  const searchQuery = useQuery({
    queryKey: coinKeys.search(trimmed),
    queryFn: ({ signal }) => fetchCoinSearch(trimmed, signal),
    enabled,
    placeholderData: keepPreviousData,
    retry: retryApiQuery,
  });

  const ids = (searchQuery.data ?? [])
    .slice(0, SEARCH_RESULT_LIMIT)
    .map((result) => result.id);

  const marketsQuery = useQuery({
    queryKey: coinKeys.marketsByIds(ids),
    queryFn: ({ signal }) => fetchCoins({ ids }, signal),
    enabled: ids.length > 0,
    placeholderData: keepPreviousData,
    retry: retryApiQuery,
  });

  const hasNoResults =
    searchQuery.isSuccess && !searchQuery.isPlaceholderData && ids.length === 0;

  // keepPreviousData serves the prior term's data (isPlaceholderData) while a
  // new query loads, which keeps isPending false. Treat that stale window as
  // pending so the page shows the skeleton instead of the previous results.
  const isPending =
    enabled &&
    !hasNoResults &&
    (searchQuery.isPending ||
      searchQuery.isPlaceholderData ||
      marketsQuery.isPending ||
      marketsQuery.isPlaceholderData);

  return {
    coins: hasNoResults ? [] : (marketsQuery.data ?? []),
    isPending,
    isError: searchQuery.isError || marketsQuery.isError,
    error: searchQuery.error ?? marketsQuery.error ?? null,
    isFetching: searchQuery.isFetching || marketsQuery.isFetching,
    refetch: () => {
      void searchQuery.refetch();
      void marketsQuery.refetch();
    },
  };
}
