import { describe, expect, it } from "vitest";
import { buildTicks, formatAxisTick } from "./chart-ticks";

type Datum = { t: number };

const DAY = 24 * 60 * 60 * 1000;
// Noon UTC keeps each full-day step on a distinct local calendar day
// regardless of the runner's timezone.
const BASE = Date.UTC(2024, 0, 1, 12, 0, 0);

describe("buildTicks", () => {
  it("returns the single timestamp when there is one point", () => {
    expect(buildTicks([{ t: 42 }], 7)).toEqual([42]);
  });

  it("returns an empty array when there are no points", () => {
    expect(buildTicks([], 7)).toEqual([]);
  });

  it("evenly spaces up to six ticks for the 1-day range", () => {
    const data: Datum[] = Array.from({ length: 10 }, (_, i) => ({ t: i }));

    // step = (10 - 1) / (6 - 1) = 1.8; indices rounded: 0, 2, 4, 5, 7, 9.
    expect(buildTicks(data, 1)).toEqual([0, 2, 4, 5, 7, 9]);
  });

  it("uses all points for the 1-day range when there are fewer than six", () => {
    const data: Datum[] = [{ t: 0 }, { t: 1 }, { t: 2 }];

    expect(buildTicks(data, 1)).toEqual([0, 1, 2]);
  });

  it("emits one tick per distinct day for multi-day ranges", () => {
    // Three days, three points each — only the first of each day is kept.
    const data: Datum[] = [];
    for (let day = 0; day < 3; day++) {
      for (let sub = 0; sub < 3; sub++) {
        data.push({ t: BASE + day * DAY + sub * 3_600_000 });
      }
    }

    expect(buildTicks(data, 7)).toEqual([BASE, BASE + DAY, BASE + 2 * DAY]);
  });

  it("thins daily ticks for the 30-day range when there are more than eight", () => {
    // Ten distinct days -> stride = ceil(10 / 8) = 2 -> indices 0,2,4,6,8.
    const data: Datum[] = Array.from({ length: 10 }, (_, i) => ({
      t: BASE + i * DAY,
    }));

    expect(buildTicks(data, 30)).toEqual([
      BASE,
      BASE + 2 * DAY,
      BASE + 4 * DAY,
      BASE + 6 * DAY,
      BASE + 8 * DAY,
    ]);
  });

  it("keeps every daily tick for the 30-day range at eight or fewer days", () => {
    const data: Datum[] = Array.from({ length: 5 }, (_, i) => ({
      t: BASE + i * DAY,
    }));

    expect(buildTicks(data, 30)).toHaveLength(5);
  });
});

describe("formatAxisTick", () => {
  it("formats the 1-day range as a time of day", () => {
    expect(formatAxisTick(BASE, 1)).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/i);
  });

  it("formats multi-day ranges as a month and day", () => {
    expect(formatAxisTick(BASE, 7)).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
    expect(formatAxisTick(BASE, 30)).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});
