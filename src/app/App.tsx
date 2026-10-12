import { CoinGrid } from "../features/coins/components/CoinGrid";
import { useCoins } from "../features/coins/hooks/use-coins";
import styles from "./App.module.scss";

function App() {
  const { data, error, isPending, isError, isFetching, refetch } = useCoins();

  if (isPending) {
    <main className={styles.dashboard}>
      <h1 className={styles.heading}>Crypto Market Dashboard</h1>
      <p role="status" className={styles.status}>
        loading cryptocurrency data...
      </p>
    </main>;
  }

  if (isError && !data) {
    return (
      <main className={styles.dashboard}>
        <h1 className={styles.heading}>Crypto Market Dashboard</h1>

        <section className={styles.errorState} role="alert">
          <h2 className={styles.errorTitle}>Unable to load market data</h2>

          <p className={styles.errorMessage}>{error.message}</p>

          <button
            className={styles.refreshButton}
            type="button"
            onClick={() => refetch()}
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.dashboard}>
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
      {isError && (
        <p role="status" className={styles.status}>
          Market data could not be refreshed. Showing previously loaded data.
        </p>
      )}

      <CoinGrid coins={data ?? []} />
    </main>
  );
}

export default App;
