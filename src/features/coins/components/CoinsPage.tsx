import { useMemo, useState } from "react";
import { Text } from "@/components/atoms/Text";
import { ErrorState } from "@/components/molecules/ErrorState";
import { ThemeToggle } from "@/components/molecules/ThemeToggle";
import { PageLayout } from "@/components/templates/PageLayout";
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
const PAGE_TITLE = "Crypto Market Dashboard";
const PAGE_SUBTITLE = "Top cryptocurrencies by market capitalization.";

export function CoinsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const isSearching = debouncedSearch.trim().length > 0;

  const browse = useCoins({ page, perPage: PER_PAGE, enabled: !isSearching });
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

  const layoutProps = {
    title: PAGE_TITLE,
    subtitle: PAGE_SUBTITLE,
    actions: <ThemeToggle />,
  };

  if (!isSearching && browse.isPending) {
    return (
      <PageLayout {...layoutProps}>
        <Text
          variant="small"
          tone="secondary"
          role="status"
          className={styles.status}
        >
          loading cryptocurrency data...
        </Text>
        <CoinGridSkeleton />
      </PageLayout>
    );
  }

  if (active.isError && active.coins.length === 0) {
    return (
      <PageLayout {...layoutProps}>
        <ErrorState
          message={active.error?.message ?? "Something went wrong."}
          onRetry={() => active.refetch()}
          isRetrying={active.isFetching}
        />
      </PageLayout>
    );
  }

  if (selectedCoin) {
    return (
      <PageLayout {...layoutProps}>
        <CoinDetailView
          coin={selectedCoin}
          onBack={() => setSelectedCoin(null)}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout {...layoutProps}>
      {active.isError && active.coins.length > 0 && (
        <Text
          variant="small"
          tone="secondary"
          role="status"
          className={styles.status}
        >
          Market data could not be refreshed. Showing previously loaded data.
        </Text>
      )}

      <CoinControls
        search={search}
        onSearchChange={handleSearchChange}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
        onRefresh={() => active.refetch()}
        isRefreshing={active.isFetching}
      />

      {isSearching && (
        <Text
          variant="small"
          tone="secondary"
          role="status"
          aria-live="polite"
          className={styles.resultsCount}
        >
          {active.isFetching ? "Searching…" : `${visibleCoins.length} results`}
        </Text>
      )}

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
    </PageLayout>
  );
}
