import styles from "./CoinPager.module.scss";

type CoinPagerProps = {
  page: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
};

export function CoinPager({
  page,
  hasPrevious,
  hasNext,
  onPageChange,
}: CoinPagerProps) {
  return (
    <nav className={styles.pager} aria-label="Coin list pagination">
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevious}
        aria-label="Previous page"
      >
        Previous
      </button>

      <span className={styles.page} aria-current="page">
        Page {page}
      </span>

      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
