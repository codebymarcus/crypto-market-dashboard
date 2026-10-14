import { useQuery } from "@tanstack/react-query";
import { fetchCoins } from "../api/coins-api";
import { coinKeys } from "./coin-keys";

export function useCoins() {
  return useQuery({
    queryKey: coinKeys.markets(),
    queryFn: ({ signal }) => fetchCoins(signal),
  });
}
