import { useQuery } from "@tanstack/react-query";
import { fetchCoins } from "../api/coins-api";

export function useCoins() {
  return useQuery({
    queryKey: ["coins", "market", "usd", 20, 1],
    queryFn: ({ signal }) => fetchCoins(signal),
  });
}
