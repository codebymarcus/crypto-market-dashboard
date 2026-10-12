import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      gcTime: 5 * 60000,
      retry: 2,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  },
});
