import styles from "./CoinGridSkeleton.module.scss";

type CoinGridSkeletonProps = {
  count?: number;
};

export function CoinGridSkeleton({ count = 8 }: CoinGridSkeletonProps) {
  return (
    <ul
      className={styles.grid}
      aria-label="Loading cryptocurrencies"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <li className={styles.card} key={index}>
          <span className={styles.avatar} aria-hidden="true" />

          <div className={styles.info}>
            <span className={styles.name} aria-hidden="true" />
            <span className={styles.symbol} aria-hidden="true" />
          </div>

          <div className={styles.price}>
            <span className={styles.priceValue} aria-hidden="true" />
            <span className={styles.change} aria-hidden="true" />
          </div>
        </li>
      ))}
    </ul>
  );
}
