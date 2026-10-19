import { describe, expect, it } from 'vitest';
import {
  PINSON_FEED_CHART,
  buildFeedAlert,
  feedPlanForAge,
  sydneyDate,
  sydneyHour,
} from './feed-alerts';
import { PINSON_GHFF_CHART } from './pinson-ghff-chart';

describe('Pinson & Kerr v3 feed columns', () => {
  it('covers every day from 1 to 78', () => {
    expect(PINSON_FEED_CHART.map((r) => r[0])).toEqual(Array.from({ length: 78 }, (_, i) => i + 1));
  });

  it('every schedule adds up to its mL/day (checks the visual read)', () => {
    for (const [day, ml, sched] of PINSON_FEED_CHART) {
      expect(sched.reduce((a, b) => a + b, 0), `day ${day}`).toBe(ml);
    }
  });

  it('pins printed rows', () => {
    const at = (d: number) => PINSON_FEED_CHART.find((r) => r[0] === d)!;
    expect(at(1)).toEqual([1, 18, [3, 3, 4, 4, 4]]);
    expect(at(28)).toEqual([28, 31, [7, 8, 8, 8]]); // 4 wks: drop to 4 feeds
    expect(at(49)).toEqual([49, 48, [12, 12, 12, 12]]);
    expect(at(62)).toEqual([62, 60, [15, 15, 15, 15]]);
    expect(at(70)).toEqual([70, 45, [15, 15, 15]]);
    expect(at(78)).toEqual([78, 15, [15]]);
  });

  it('volumes stay near 25% of the chart weight while milk-fed (cross-check)', () => {
    for (const [day, ml] of PINSON_FEED_CHART.filter(([d]) => d <= 62)) {
      const wt = PINSON_GHFF_CHART.find((r) => r[0] === day)![2];
      expect(ml / wt, `day ${day}`).toBeGreaterThan(0.23);
      expect(ml / wt, `day ${day}`).toBeLessThan(0.27);
    }
  });
});

describe('feedPlanForAge', () => {
  it('Biolac uses the chart as printed', () => {
    const p = feedPlanForAge(11, 'biolac');
    expect(p).toMatchObject({ dailyMl: 21, feedsPerDay: 5, schedule: [4, 4, 4, 4, 5], weaned: false });
  });

  it("goat's milk scales each feed by x1.148 to the nearest 0.5 mL", () => {
    // 4 -> 4.59 -> 4.5; 5 -> 5.74 -> 5.5
    const p = feedPlanForAge(11, 'goats-milk');
    expect(p.schedule).toEqual([4.5, 4.5, 4.5, 4.5, 5.5]);
    expect(p.dailyMl).toBe(23.5);
  });

  it('is weaned from day 79', () => {
    expect(feedPlanForAge(79, 'goats-milk')).toMatchObject({ weaned: true, dailyMl: 0 });
  });

  it('treats day 0 as day 1', () => {
    expect(feedPlanForAge(0, 'biolac').dailyMl).toBe(18);
  });
});

describe('buildFeedAlert', () => {
  // Bubbles DOB 9 Oct (stored 13:00Z on the 8th), Squeak 8 Oct.
  const pups = [
    { name: 'Bubbles', orgAnimalId: 'ORG-2026-0096', dateOfBirth: new Date('2026-10-08T13:00:00.000Z') },
    { name: 'Squeak', orgAnimalId: 'ORG-2026-0097', dateOfBirth: new Date('2026-10-07T13:00:00.000Z') },
  ];

  it('flags a pup whose schedule changes today, and leaves the other alone', () => {
    // 6am Sydney on 21 Oct = 19:00 UTC on 20 Oct. Bubbles day 12 (same as 11), Squeak day 13 (21 -> 22 mL).
    const a = buildFeedAlert(pups, new Date('2026-10-20T19:05:00.000Z'), 'biolac');
    expect(a.date).toBe('2026-10-21');
    const [b, s] = a.lines;
    expect(b.today!.ageDays).toBe(12);
    expect(b.changed).toBe(false);
    expect(s.today!.ageDays).toBe(13);
    expect(s.changed).toBe(true);
    expect(a.anyChanged).toBe(true);
    expect(a.subject).toMatch(/Squeak 22 mL\/day/);
    expect(a.subject).not.toMatch(/Bubbles/);
    expect(a.text).toMatch(/CHANGED: Squeak/);
  });

  it('reports no change on a quiet day', () => {
    // 20 Oct: Bubbles day 11 (21, same as day 10), Squeak day 12 (21, same as 11).
    const a = buildFeedAlert(pups, new Date('2026-10-19T19:05:00.000Z'), 'biolac');
    expect(a.anyChanged).toBe(false);
  });

  it("includes the goat's milk recipe for the day's total and the derived caveat", () => {
    const a = buildFeedAlert(pups, new Date('2026-10-20T19:05:00.000Z'), 'goats-milk');
    expect(a.text).toMatch(/goat's milk \+ .* g Glucodin \+ .* mL Troy\/Novartis calcium syrup/);
    expect(a.text).toMatch(/derived/);
  });

  it('copes with a pup that has no date of birth', () => {
    const a = buildFeedAlert([{ name: 'X', orgAnimalId: null, dateOfBirth: null }], new Date(), 'goats-milk');
    expect(a.lines[0].today).toBeNull();
    expect(a.text).toMatch(/no date of birth/);
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
