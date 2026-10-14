import type { ChartPeriod } from "../types";
import styles from "./ChartPeriodSelector.module.scss";

const PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: 1, label: "1D" },
  { value: 7, label: "7D" },
  { value: 30, label: "30D" },
];

type ChartPeriodSelectorProps = {
  value: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
};

export function ChartPeriodSelector({
  value,
  onChange,
}: ChartPeriodSelectorProps) {
  return (
    <div className={styles.group} role="group" aria-label="Chart time range">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          type="button"
          className={styles.option}
          aria-pressed={period.value === value}
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
