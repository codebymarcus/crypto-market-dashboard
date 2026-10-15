import { RefreshIcon } from "@/components/ui/icons/RefreshIcon";
import type { SortDirection, SortField } from "../utils/sort-coins";
import styles from "./CoinControls.module.scss";

type CoinControlProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (value: SortDirection) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
};

export function CoinControls({
  search,
  onSearchChange,
  sortField,
  onSortDirectionChange,
  sortDirection,
  onSortFieldChange,
  onRefresh,
  isRefreshing,
}: CoinControlProps) {
  return (
    <section className={styles.controls} aria-label="Coin filters">
      <div className={styles.searchGroup}>
        <label className={styles.label} htmlFor="coin-search">
          Search cryptocurrencies
        </label>

        <input
          type="search"
          id="coin-search"
          className={styles.searchInput}
          placeholder="Search by name or symbol..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className={styles.actionsGroup}>
        <div className={styles.sortGroup}>
          <div className={styles.field}>
            <label htmlFor="sort-field" className={styles.label}>
              Sort by
            </label>

            <div className={styles.selectWrapper}>
              <select
                id="sort-field"
                className={styles.select}
                value={sortField}
                onChange={(event) =>
                  onSortFieldChange(event.target.value as SortField)
                }
              >
                <option value="price">Current price</option>
                <option value="change">24h change</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="sort-direction" className={styles.label}>
              Order
            </label>

            <div className={styles.selectWrapper}>
              <select
                id="sort-direction"
                className={styles.select}
                value={sortDirection}
                onChange={(event) =>
                  onSortDirectionChange(event.target.value as SortDirection)
                }
              >
                <option value="desc">Highest first</option>
                <option value="asc">Lowest first</option>
              </select>
            </div>
          </div>
        </div>

        <button
          className={styles.refreshButton}
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh"
          title="Refresh market data"
        >
          <RefreshIcon
            className={`${styles.icon} ${isRefreshing ? styles.spinning : ""}`}
          />
        </button>
      </div>
    </section>
  );
}
