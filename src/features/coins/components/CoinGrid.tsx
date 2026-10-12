import type { Coin } from "../types";
import { formatPrice } from "../utils/format-price";
import styles from "./CoinGrid.module.scss";

type CoinGridProps = {
  coins: Coin[];
  emptyMessage?: string;
};

export function CoinGrid({
  coins,
  emptyMessage = "No cryptocurrencies available.",
}: CoinGridProps) {
  if (coins.length === 0) {
    return (
      <p className={styles.empty} role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {coins.map((coin) => {
        const change = coin.price_change_percentage_24h;

        const changeClass =
          change === null
            ? styles.neutral
            : change >= 0
              ? styles.positive
              : styles.negative;

        return (
          <li className={styles.card} key={coin.id}>
            <img
              src={coin.image}
              alt={`${coin.name} logo`}
              width={40}
              height={40}
              className={styles.image}
            />

            <div className={styles.info}>
              <strong className={styles.name}>{coin.name}</strong>
              <span className={styles.symbol}>{coin.symbol.toUpperCase()}</span>
            </div>

            <div className={styles.price}>
              <strong className={styles.priceValue}>
                {formatPrice(coin.current_price)}
              </strong>

              <span className={`${styles.change} ${changeClass}`}>
                {change === null
                  ? "N/A"
                  : `${change >= 0 ? "+" : ""}${change.toFixed(2)}`}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
