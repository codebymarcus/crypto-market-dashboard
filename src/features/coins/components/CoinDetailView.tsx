import type { Coin } from "../types";
import styles from "./CoinDetailView.module.scss";

interface CoinDetailViewProps {
  coin: Coin;
  onBack: () => void;
}

export function CoinDetailView({ coin, onBack }: CoinDetailViewProps) {
  const change = coin.price_change_percentage_24h;

  return (
    <section className={styles.container}>
      <button type="button" className={styles.backButton} onClick={onBack}>
        ← Back to market
      </button>

      <header className={styles.header}>
        <img className={styles.icon} src={coin.image} alt="" />

        <div>
          <h1>{coin.name}</h1>
          <p>{coin.symbol.toUpperCase()}</p>
        </div>

        <span className={styles.rank}>Rank #{coin.market_cap_rank}</span>
      </header>

      <section className={styles.priceSection}>
        <p className={styles.label}>Current price</p>

        <h2>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 8,
          }).format(coin.current_price)}
        </h2>

        <p
          className={
            change == null
              ? styles.neutral
              : change >= 0
                ? styles.positive
                : styles.negative
          }
        >
          {change == null
            ? "24h change unavailable"
            : `${change >= 0 ? "+" : ""}${change.toFixed(2)}% (24h)`}
        </p>
      </section>

      <section className={styles.stats}>
        <article className={styles.statCard}>
          <p className={styles.label}>Market cap</p>
          <strong>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              notation: "compact",
              maximumFractionDigits: 2,
            }).format(coin.market_cap)}
          </strong>
        </article>
      </section>

      <section className={styles.chartPlaceholder}>
        <h2>Price history</h2>
        <p>Historical price chart will be implemented in the next step.</p>
      </section>
    </section>
  );
}
