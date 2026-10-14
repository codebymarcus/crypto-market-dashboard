import { useEffect, useMemo, useState } from "react";
import {
  CoinControls,
  CoinDetailView,
  CoinGrid,
  CoinGridSkeleton,
  sortCoins,
  useCoins,
  type Coin,
  type SortDirection,
  type SortField,
} from "@/features/coins";
import styles from "./App.module.scss";
import { ErrorState } from "@/components/ui/ErrorState";
import { usePreferencesStore } from "@/stores/use-preferences-store";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function App() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  const { data, error, isPending, isError, isFetching, refetch } = useCoins();

  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const visibleCoins = useMemo(() => {
    if (!data) return [];

    const normalizedSearch = search.trim().toLowerCase();

    const filteredCoins = data.filter(
      (coin) =>
        coin.name.toLowerCase().includes(normalizedSearch) ||
        coin.symbol.toLowerCase().includes(normalizedSearch),
    );

    return sortCoins(filteredCoins, sortField, sortDirection);
  }, [data, search, sortField, sortDirection]);

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
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </header>
  );

  if (isPending) {
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

  if (isError && !data) {
    return (
      <main className={styles.dashboard}>
        {header}
        <ErrorState
          message={error.message}
          onRetry={() => refetch()}
          isRetrying={isFetching}
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
      {isError && (
        <p role="status" className={styles.status}>
          Market data could not be refreshed. Showing previously loaded data.
        </p>
      )}

      <CoinControls
        search={search}
        onSearchChange={setSearch}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
      />

      <p className={styles.resultsCount} role="status">
        Showing {visibleCoins.length} of {data?.length ?? 0} coins
      </p>

      <CoinGrid
        coins={visibleCoins}
        onCoinSelect={setSelectedCoin}
        emptyMessage={
          data?.length === 0
            ? "No market data is currently available"
            : "No cryptocurrencies match your search. Try another name or symbol."
        }
      />
    </main>
  );
}

export default App;
