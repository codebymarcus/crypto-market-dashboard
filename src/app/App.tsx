import { useMemo, useState } from "react";
import { CoinGrid } from "../features/coins/components/CoinGrid";
import { useCoins } from "../features/coins/hooks/use-coins";
import styles from "./App.module.scss";
import {
  sortCoins,
  type SortDirection,
  type SortField,
} from "../features/coins/utils/sort-coins";
import { CoinControls } from "../features/coins/components/CoinControls";
import { ErrorState } from "../components/ui/ErrorState";
import { CoinGridSkeleton } from "../features/coins/components/CoinGridSkeleton";

function App() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { data, error, isPending, isError, isFetching, refetch } = useCoins();

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

      <button
        className={styles.refreshButton}
        type="button"
        onClick={() => refetch()}
        disabled={isFetching}
      >
        {isFetching ? "Refreshing..." : "Refresh"}
      </button>
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
