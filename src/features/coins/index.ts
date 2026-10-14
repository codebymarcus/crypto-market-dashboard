// Public API of the `coins` feature.
//
// Import coins functionality from "@/features/coins" - never from deep paths into
// this slice. Anything not re-exported here is internal to the feature (e.g. the
// API modules, use-market-chart, PriceChart, ChartPeriodSelector) and must not be
// imported from outside.

// Components
export { CoinControls } from "./components/CoinControls";
export { CoinDetailView } from "./components/CoinDetailView";
export { CoinGrid } from "./components/CoinGrid";
export { CoinGridSkeleton } from "./components/CoinGridSkeleton";

// Hooks
export { useCoins } from "./hooks/use-coins";

// Utilities
export { sortCoins } from "./utils/sort-coins";
export type { SortDirection, SortField } from "./utils/sort-coins";

// Domain types
export type { Coin } from "./types";
