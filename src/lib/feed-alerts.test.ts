import { describe, expect, it } from 'vitest';
import {
  PINSON_COWS_FEED_CHART,
  PINSON_FEED_CHART,
  ageForForearm,
  buildFeedAlert,
  feedPlanForAge,
  resolveAge,
  sydneyDate,
  sydneyHour,
} from './feed-alerts';

/**
 * Feed volumes go straight into a daily email carers act on, so every value
 * is pinned to the printed charts. If a test here fails, the chart data has
 * changed: check it against the PDF before touching the test.
 */

const days = (chart: [number, number, number[]][]) => chart.map((r) => r[0]);
const at = (chart: [number, number, number[]][], d: number) => chart.find((r) => r[0] === d)!;

describe("Pinson & Kerr cow's milk chart (used for goat's milk)", () => {
  it('has every day from 1 to 78', () => {
    expect(days(PINSON_COWS_FEED_CHART)).toEqual(Array.from({ length: 78 }, (_, i) => i + 1));
  });

  it('every day’s feeds add up to its mL/day', () => {
    for (const [d, ml, s] of PINSON_COWS_FEED_CHART) {
      expect(s.reduce((a, b) => a + b, 0), `day ${d}`).toBe(ml);
    }
  });

  it('matches every printed weekly row', () => {
    expect(at(PINSON_COWS_FEED_CHART, 1)).toEqual([1, 23, [4, 4, 5, 5, 5]]);
    expect(at(PINSON_COWS_FEED_CHART, 7)).toEqual([7, 26, [5, 5, 5, 5, 6]]);
    expect(at(PINSON_COWS_FEED_CHART, 14)).toEqual([14, 31, [6, 6, 6, 6, 7]]);
    expect(at(PINSON_COWS_FEED_CHART, 21)).toEqual([21, 36, [7, 7, 7, 7, 8]]);
    expect(at(PINSON_COWS_FEED_CHART, 28)).toEqual([28, 41, [10, 10, 10, 11]]);
    expect(at(PINSON_COWS_FEED_CHART, 35)).toEqual([35, 46, [11, 11, 12, 12]]);
    expect(at(PINSON_COWS_FEED_CHART, 42)).toEqual([42, 50, [12, 12, 13, 13]]);
    expect(at(PINSON_COWS_FEED_CHART, 49)).toEqual([49, 53, [13, 13, 13, 14]]);
    expect(at(PINSON_COWS_FEED_CHART, 56)).toEqual([56, 56, [14, 14, 14, 14]]);
    expect(at(PINSON_COWS_FEED_CHART, 63)).toEqual([63, 58, [14, 14, 15, 15]]);
    expect(at(PINSON_COWS_FEED_CHART, 70)).toEqual([70, 45, [15, 15, 15]]);
    expect(at(PINSON_COWS_FEED_CHART, 73)).toEqual([73, 30, [15, 15]]);
    expect(at(PINSON_COWS_FEED_CHART, 77)).toEqual([77, 15, [15]]);
  });

  it('never exceeds 15 mL a feed, and volume only rises until weaning starts (day 70)', () => {
    for (const [d, ml, s] of PINSON_COWS_FEED_CHART) {
      expect(Math.max(...s), `day ${d}`).toBeLessThanOrEqual(15);
      if (d > 1 && d < 70) expect(ml, `day ${d}`).toBeGreaterThanOrEqual(at(PINSON_COWS_FEED_CHART, d - 1)[1]);
    }
  });
});

describe('Pinson & Kerr Biolac chart v3', () => {
  it('has every day 1-78, each adding up', () => {
    expect(days(PINSON_FEED_CHART)).toEqual(Array.from({ length: 78 }, (_, i) => i + 1));
    for (const [d, ml, s] of PINSON_FEED_CHART) expect(s.reduce((a, b) => a + b, 0), `day ${d}`).toBe(ml);
  });

  it('matches printed rows, including the worked example in Manual 3.026 (day 17 = 24 mL)', () => {
    expect(at(PINSON_FEED_CHART, 1)).toEqual([1, 18, [3, 3, 4, 4, 4]]);
    expect(at(PINSON_FEED_CHART, 17)).toEqual([17, 24, [4, 5, 5, 5, 5]]);
    expect(at(PINSON_FEED_CHART, 28)).toEqual([28, 31, [7, 8, 8, 8]]);
    expect(at(PINSON_FEED_CHART, 62)).toEqual([62, 60, [15, 15, 15, 15]]);
  });

  it('is a lower volume than the cow’s milk chart every day to 8 weeks (as printed; they cross near day 60)', () => {
    for (let d = 1; d <= 56; d++) expect(at(PINSON_FEED_CHART, d)[1], `day ${d}`).toBeLessThan(at(PINSON_COWS_FEED_CHART, d)[1]);
  });
});

describe('ageForForearm (Pinson forearm column)', () => {
  it('reads exact chart values as that day', () => {
    expect(ageForForearm(57.5).ageDays).toBe(1);
    expect(ageForForearm(63).ageDays).toBe(5);
    expect(ageForForearm(73.5).ageDays).toBe(14);
    expect(ageForForearm(77).ageDays).toBe(17); // Manual 3.026 worked example: 77 mm = about 17 days
  });
  it('interpolates between days and rounds to the nearest', () => {
    expect(ageForForearm(74).ageDays).toBe(14); // 73.5 (d14) .. 75 (d15) -> 14.33
    expect(ageForForearm(79).ageDays).toBe(19); // 78.5 (d18) .. 79.5 (d19) -> 18.5 -> 19
  });
  it('flags a forearm outside the chart', () => {
    expect(ageForForearm(50)).toEqual({ ageDays: 1, outsideChart: true });
  });
});

describe("feedPlanForAge: goat's milk uses the cow's milk chart as printed", () => {
  it('no scaling, no rounding', () => {
    expect(feedPlanForAge(13, 'goats-milk')).toMatchObject({ dailyMl: 30, schedule: [6, 6, 6, 6, 6], feedsPerDay: 5 });
    expect(feedPlanForAge(16, 'goats-milk')).toMatchObject({ dailyMl: 33, schedule: [6, 6, 7, 7, 7] });
    expect(feedPlanForAge(16, 'biolac')).toMatchObject({ dailyMl: 23, schedule: [4, 4, 5, 5, 5] });
  });
  it('is weaned from day 79', () => {
    expect(feedPlanForAge(79, 'goats-milk')).toMatchObject({ weaned: true, dailyMl: 0 });
  });
  it('uses each chart’s own stage notes', () => {
    expect(feedPlanForAge(28, 'goats-milk').milestone).toMatch(/5 feeds a day to 4/);
    expect(feedPlanForAge(62, 'goats-milk').milestone).toBeNull(); // the 15 mL note is Biolac-only
    expect(feedPlanForAge(62, 'biolac').milestone).toMatch(/15 mL/);
  });
});

// Real records: measurements are stored at Sydney local times.
const bubble = {
  name: 'Bubble',
  orgAnimalId: 'ORG-2026-0096',
  dateOfBirth: new Date('2026-10-08T13:00:00.000Z'),
  measurements: [
    { date: new Date('2026-10-12T13:00:00.000Z'), armLengthMm: 63 }, // 13 Oct, intake
    { date: new Date('2026-10-18T13:00:00.000Z'), armLengthMm: 67 },
    { date: new Date('2026-10-21T01:00:00.000Z'), armLengthMm: 73 }, // 21 Oct noon
  ],
};
const squeak = {
  name: 'Squeak',
  orgAnimalId: 'ORG-2026-0097',
  dateOfBirth: new Date('2026-10-07T13:00:00.000Z'),
  measurements: [
    { date: new Date('2026-10-18T13:00:00.000Z'), armLengthMm: 74 }, // 19 Oct, intake
    { date: new Date('2026-10-21T01:00:00.000Z'), armLengthMm: 79 },
  ],
};

describe('resolveAge follows the Manual: intake forearm, then count days', () => {
  it('Bubble: 63 mm on 13 Oct = day 5, so day 13 on 21 Oct', () => {
    const b = resolveAge(bubble, '2026-10-21')!;
    expect(b).toMatchObject({ ageDays: 13, source: 'intake-forearm', intakeForearmMm: 63, latestForearmMm: 73 });
  });
  it('Squeak: 74 mm on 19 Oct = day 14, so day 16 on 21 Oct', () => {
    expect(resolveAge(squeak, '2026-10-21')!.ageDays).toBe(16);
  });
  it('ignores later forearms for age (they are shown, not used)', () => {
    const later = { ...squeak, measurements: [...squeak.measurements, { date: new Date('2026-10-22T01:00:00.000Z'), armLengthMm: 85 }] };
    expect(resolveAge(later, '2026-10-21')!.ageDays).toBe(16);
  });
  it('falls back to date of birth when no forearm is recorded', () => {
    expect(resolveAge({ ...squeak, measurements: [] }, '2026-10-21')).toMatchObject({ ageDays: 13, source: 'date-of-birth' });
  });
});

describe('buildFeedAlert', () => {
  // 6:05am Sydney on 22 Oct = 19:05 UTC on 21 Oct.
  const now = new Date('2026-10-21T19:05:00.000Z');

  it("gives the cow's milk chart volumes for goat's milk", () => {
    const a = buildFeedAlert([bubble, squeak], now, 'goats-milk');
    expect(a.date).toBe('2026-10-22');
    const [b, s] = a.lines;
    expect(b.today).toMatchObject({ ageDays: 14, dailyMl: 31, schedule: [6, 6, 6, 6, 7] });
    expect(s.today).toMatchObject({ ageDays: 17, dailyMl: 33, schedule: [6, 6, 7, 7, 7] });
    // Bubble 30 -> 31 changes; Squeak 33 -> 33 doesn't.
    expect(b.changed).toBe(true);
    expect(s.changed).toBe(false);
    expect(a.subject).toBe('Feed change Thu, 22 Oct: Bubble 31 mL/day');
    expect(a.text).toMatch(/Age from intake forearm 63 mm on 13\/10\/2026/);
    expect(a.text).toMatch(/goat's milk/);
    expect(a.text).not.toMatch(/derived/i);
  });

  it('flags the 2-week chart note', () => {
    const a = buildFeedAlert([bubble], now, 'goats-milk');
    expect(a.text).toMatch(/Chart note: Start the transition to feeding for age/);
  });

  it("scales the goat's milk recipe to the day's total", () => {
    const a = buildFeedAlert([bubble, squeak], now, 'goats-milk');
    // 31 + 33 = 64 mL: 3.5 g Glucodin and 1 mL calcium syrup per 100 mL.
    expect(a.text).toMatch(/64 mL goat's milk \+ 2\.2 g Glucodin \+ 0\.6 mL Troy\/Vetsense calcium syrup/);
  });

  it('copes with a pup with no forearm or date of birth', () => {
    const a = buildFeedAlert([{ name: 'X', orgAnimalId: null, dateOfBirth: null }], now, 'goats-milk');
    expect(a.lines[0].today).toBeNull();
    expect(a.text).toMatch(/no forearm or date of birth/);
  });
});

describe('Sydney time helpers', () => {
  it('handles daylight saving: 19:00 UTC is 6am in October (AEDT)', () => {
    expect(sydneyHour(new Date('2026-10-20T19:10:00.000Z'))).toBe(6);
    expect(sydneyDate(new Date('2026-10-20T19:10:00.000Z'))).toBe('2026-10-21');
  });
  it('and 20:00 UTC is 6am in June (AEST)', () => {
    expect(sydneyHour(new Date('2027-06-10T20:10:00.000Z'))).toBe(6);
  });
});
