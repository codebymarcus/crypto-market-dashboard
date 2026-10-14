import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchCoins } from "../api/coins-api";
import { retryApiQuery } from "@/lib/query-retry";
import { coinKeys } from "./coin-keys";

export function useCoins({ page, perPage }: { page: number; perPage: number }) {
  return useQuery({
    queryKey: coinKeys.markets({ page, perPage }),
    queryFn: ({ signal }) => fetchCoins({ page, perPage }, signal),
    placeholderData: keepPreviousData,
    retry: retryApiQuery,
  });
}
