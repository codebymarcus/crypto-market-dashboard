import { useMemo, useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CoinControls } from "./CoinControls";
import { CoinDetailView } from "./CoinDetailView";
import { CoinGrid } from "./CoinGrid";
import { CoinGridSkeleton } from "./CoinGridSkeleton";
import { CoinPager } from "./CoinPager";
import { useCoins } from "../hooks/use-coins";
import { useCoinSearch, type CoinListState } from "../hooks/use-coin-search";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import {
  sortCoins,
  type SortDirection,
  type SortField,
} from "../utils/sort-coins";
import type { Coin } from "../types";
import styles from "./CoinsPage.module.scss";

const PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function CoinsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const isSearching = debouncedSearch.trim().length > 0;

  const browse = useCoins({ page, perPage: PER_PAGE });
  const searchResults = useCoinSearch(debouncedSearch);

  const browseState: CoinListState = {
    coins: browse.data ?? [],
    isPending: browse.isPending,
    isError: browse.isError,
    error: browse.error,
    isFetching: browse.isFetching,
    refetch: () => void browse.refetch(),
  };

  const active = isSearching ? searchResults : browseState;

  const visibleCoins = useMemo(
    () => sortCoins(active.coins, sortField, sortDirection),
    [active.coins, sortField, sortDirection],
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const header = (
    <header className={styles.header}>
      <div>
        <h1 className={styles.heading}>Crypto Market Dashboard</h1>
        <p className={styles.subtitle}>
          Top cryptocurrencies by market capitalization.
        </p>
      </div>

      <div className={styles.headerActions}>
        <ThemeToggle />

        <button
          className={styles.refreshButton}
          type="button"
          onClick={() => active.refetch()}
          disabled={active.isFetching}
        >
          {active.isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </header>
  );

  if (!isSearching && browse.isPending) {
    return (
      <main className={styles.dashboard}>
        <h1 className={styles.heading}>Crypto Market Dashboard</h1>
        <p role="status" className={styles.status}>
          loading cryptocurrency data...
        </p>
        <CoinGridSkeleton />
      </main>
    );
  }

  if (active.isError && active.coins.length === 0) {
    return (
      <main className={styles.dashboard}>
        {header}
        <ErrorState
          message={active.error?.message ?? "Something went wrong."}
          onRetry={() => active.refetch()}
          isRetrying={active.isFetching}
        />
      </main>
    );
  }

  if (selectedCoin) {
    return (
      <main className={styles.dashboard}>
        {header}
        <CoinDetailView
          coin={selectedCoin}
          onBack={() => setSelectedCoin(null)}
        />
      </main>
    );
  }

  return (
    <main className={styles.dashboard}>
      {header}
      {active.isError && active.coins.length > 0 && (
        <p role="status" className={styles.status}>
          Market data could not be refreshed. Showing previously loaded data.
        </p>
      )}

      <CoinControls
        search={search}
        onSearchChange={handleSearchChange}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
      />

      <p className={styles.resultsCount} role="status">
        {isSearching ? `${visibleCoins.length} results` : `Page ${page}`}
      </p>

      {active.isPending ? (
        <CoinGridSkeleton />
      ) : (
        <CoinGrid
          coins={visibleCoins}
          onCoinSelect={setSelectedCoin}
          emptyMessage={
            isSearching
              ? "No cryptocurrencies match your search. Try another name or symbol."
              : "No market data is currently available"
          }
        />
      )}

      {!isSearching && (
        <CoinPager
          page={page}
          hasPrevious={page > 1}
          hasNext={browseState.coins.length === PER_PAGE}
          onPageChange={setPage}
        />
      )}
    </main>
  );
}
