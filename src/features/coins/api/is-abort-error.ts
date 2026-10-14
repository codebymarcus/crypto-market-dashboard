/**
 * Detects a request-cancellation error.
 *
 * An aborted `fetch()` rejects with a `DOMException` named "AbortError".
 * We identify it by `name` rather than `instanceof Error`, because
 * `DOMException` does not reliably extend `Error` across environments
 * (e.g. jsdom), which would otherwise misclassify cancellations as
 * network errors.
 */
export function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  );
}
