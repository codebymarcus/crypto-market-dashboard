import { useState } from "react";
import type { ChartPeriod, Coin } from "../types";
import { useMarketChart } from "../hooks/use-market-chart";
import { ChartPeriodSelector } from "./ChartPeriodSelector";
import { PriceChart } from "./PriceChart";
import { Text } from "@/components/atoms/Text";
import { ErrorState } from "@/components/molecules/ErrorState";
import styles from "./CoinDetailView.module.scss";

type CoinDetailViewProps = {
  coin: Coin;
  onBack: () => void;
};

export function CoinDetailView({ coin, onBack }: CoinDetailViewProps) {
  const change = coin.price_change_percentage_24h;
  const [period, setPeriod] = useState<ChartPeriod>(7);

  const {
    data: chart,
    isPending: isChartPending,
    isError: isChartError,
    error: chartError,
    refetch: refetchChart,
    isFetching: isChartFetching,
  } = useMarketChart(coin.id, period);

  return (
    <section className={styles.container}>
      <button type="button" className={styles.backButton} onClick={onBack}>
        ← Back to market
      </button>

      <header className={styles.header}>
        <img className={styles.icon} src={coin.image} alt="" />

        <div>
          <Text variant="title" as="h1">
            {coin.name}
          </Text>
          <Text variant="subtitle" tone="secondary" className={styles.symbol}>
            {coin.symbol.toUpperCase()}
          </Text>
        </div>

        <Text variant="small" tone="secondary" className={styles.rank}>
          Rank #{coin.market_cap_rank}
        </Text>
      </header>

      <section className={styles.priceSection}>
        <Text variant="small" tone="secondary">
          Current price
        </Text>

        <h2 className={styles.priceValue}>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 8,
          }).format(coin.current_price)}
        </h2>

        <Text
          variant="body"
          tone={
            change == null ? "secondary" : change >= 0 ? "positive" : "negative"
          }
        >
          {change == null
            ? "24h change unavailable"
            : `${change >= 0 ? "+" : ""}${change.toFixed(2)}% (24h)`}
        </Text>
      </section>

      <section className={styles.stats}>
        <article className={styles.statCard}>
          <Text variant="small" tone="secondary">
            Market cap
          </Text>
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

      <section className={styles.chartSection}>
        <header className={styles.chartHeader}>
          <Text variant="heading" as="h2">
            Price history
          </Text>
          <ChartPeriodSelector value={period} onChange={setPeriod} />
        </header>

        {isChartPending ? (
          <div
            className={styles.chartSkeleton}
            role="status"
            aria-label="Loading price history"
          />
        ) : isChartError ? (
          <ErrorState
            title="Unable to load price history."
            message={chartError.message}
            onRetry={() => refetchChart()}
            isRetrying={isChartFetching}
          />
        ) : chart.prices.length === 0 ? (
          <Text variant="body" tone="secondary">
            No price history is available for this period.
          </Text>
        ) : (
          <PriceChart prices={chart.prices} period={period} />
        )}
      </section>
    </section>
  );
}
