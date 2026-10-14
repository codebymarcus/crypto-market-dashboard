// Public API of the `coins` feature.
//
// Import coins functionality from "@/features/coins" - never from deep paths into
// this slice. The feature's page is its public entry point; everything it composes
// (CoinControls, CoinGrid, CoinDetailView, hooks, api, utils, PriceChart, ...) is
// internal to the feature and must not be imported from outside.

export { CoinsPage } from "./components/CoinsPage";
