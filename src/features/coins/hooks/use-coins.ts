import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchCoins } from "../api/coins-api";
import { retryApiQuery } from "@/lib/query-retry";
import { coinKeys } from "./coin-keys";

export function useCoins({
  page,
  perPage,
  enabled = true,
}: {
  page: number;
  perPage: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: coinKeys.markets({ page, perPage }),
    queryFn: ({ signal }) => fetchCoins({ page, perPage }, signal),
    enabled,
    placeholderData: keepPreviousData,
    retry: retryApiQuery,
  });
}
