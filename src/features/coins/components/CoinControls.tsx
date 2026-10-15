import { IconButton } from "@/components/atoms/IconButton";
import { RefreshIcon } from "@/components/atoms/icons/RefreshIcon";
import { SearchBox } from "@/components/molecules/SearchBox";
import { SelectField } from "@/components/molecules/SelectField";
import type { SortDirection, SortField } from "../utils/sort-coins";
import styles from "./CoinControls.module.scss";

const SORT_FIELD_OPTIONS = [
  { value: "price", label: "Current price" },
  { value: "change", label: "24h change" },
] as const satisfies readonly { value: SortField; label: string }[];

const SORT_DIRECTION_OPTIONS = [
  { value: "desc", label: "Highest first" },
  { value: "asc", label: "Lowest first" },
] as const satisfies readonly { value: SortDirection; label: string }[];

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
        <SearchBox
          id="coin-search"
          label="Search cryptocurrencies"
          placeholder="Search by name or symbol..."
          value={search}
          onChange={onSearchChange}
        />
      </div>

      <div className={styles.actionsGroup}>
        <div className={styles.sortGroup}>
          <SelectField
            id="sort-field"
            label="Sort by"
            value={sortField}
            options={SORT_FIELD_OPTIONS}
            onChange={onSortFieldChange}
          />
          <SelectField
            id="sort-direction"
            label="Order"
            value={sortDirection}
            options={SORT_DIRECTION_OPTIONS}
            onChange={onSortDirectionChange}
          />
        </div>

        <IconButton
          busy={isRefreshing}
          label="Refresh"
          title="Refresh market data"
          onClick={onRefresh}
        >
          <RefreshIcon />
        </IconButton>
      </div>
    </section>
  );
}
