import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPeriod, HistoricalDataPoint } from "../types";
import { formatPrice } from "../utils/format-price";
import { buildTicks, formatAxisTick } from "../utils/chart-ticks";
import styles from "./PriceChart.module.scss";

type PriceChartProps = {
  prices: HistoricalDataPoint[];
  period: ChartPeriod;
};

type ChartDatum = { t: number; value: number };

const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const { t, value } = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>
        {new Date(t).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p className={styles.tooltipValue}>{formatPrice(value)}</p>
    </div>
  );
}

export function PriceChart({ prices, period }: PriceChartProps) {
  const data: ChartDatum[] = prices.map(([t, value]) => ({ t, value }));

  const first = data[0]?.value ?? 0;
  const last = data[data.length - 1]?.value ?? 0;
  const trendUp = last >= first;
  const color = trendUp ? "var(--color-positive)" : "var(--color-negative)";

  const ticks = buildTicks(data, period);
  const periodLabel = period === 1 ? "1 day" : `${period} days`;
  const ariaLabel = `Price chart over the last ${periodLabel}, trending ${
    trendUp ? "up" : "down"
  }.`;

  return (
    <div className={styles.container} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="priceChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            ticks={ticks}
            tickFormatter={(t) => formatAxisTick(t as number, period)}
            tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            minTickGap={16}
          />

          <YAxis
            dataKey="value"
            orientation="right"
            domain={["auto", "auto"]}
            tickFormatter={(v) => compactUsd.format(v as number)}
            tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={64}
          />

          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "var(--color-border-strong)" }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#priceChartFill)"
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            isAnimationActive="auto"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
