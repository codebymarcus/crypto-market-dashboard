import { ApiError } from "./api-error";

/**
 * Shared React Query `retry` predicate. For an ApiError carrying a 4xx status,
 * retries only the transient 408/429 (once); anything else retries up to twice.
 */
export function retryApiQuery(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status) {
    if (error.status >= 400 && error.status < 500) {
      return (error.status === 408 || error.status === 429) && failureCount < 1;
    }
  }

  return failureCount < 2;
}
