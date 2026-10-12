export function formatPrice(price: number | null): string {
  if (price === null || !Number.isFinite(price)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 8,
  }).format(price);
}
