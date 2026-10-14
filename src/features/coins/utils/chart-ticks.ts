import type { ChartPeriod } from "../types";

type TickPoint = { t: number };

export function formatAxisTick(timestamp: number, period: ChartPeriod): string {
  const date = new Date(timestamp);

  if (period === 1) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// CoinGecko returns many points per day for multi-day ranges, which would
// otherwise render as repeated "Oct 7, Oct 7, …" axis labels. Build explicit
// ticks instead: evenly spaced times for 1D, one per distinct day otherwise
// (thinned for 30D so labels don't collide).
export function buildTicks(data: TickPoint[], period: ChartPeriod): number[] {
  if (data.length <= 1) {
    return data.map((point) => point.t);
  }

  if (period === 1) {
    const count = Math.min(6, data.length);
    const step = (data.length - 1) / (count - 1);
    return Array.from(
      { length: count },
      (_, i) => data[Math.round(i * step)].t,
    );
  }

  const dailyTicks: number[] = [];
  let lastDay = "";

  for (const point of data) {
    const day = new Date(point.t).toDateString();
    if (day !== lastDay) {
      dailyTicks.push(point.t);
      lastDay = day;
    }
  }

  if (period === 30 && dailyTicks.length > 8) {
    const stride = Math.ceil(dailyTicks.length / 8);
    return dailyTicks.filter((_, i) => i % stride === 0);
  }

  return dailyTicks;
}
