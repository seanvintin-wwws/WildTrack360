import { describe, expect, it } from 'vitest';
import {
  BIOLAC_FEEDING_GUIDE,
  GOATS_MILK_VOLUME_FACTOR,
  calculateChartFeed,
  interpolateChart,
  littleRedAdLibPerFeedMl,
} from './flyingFoxChart';

describe('Biolac feeding guide', () => {
  it('pins the published weekly rows', () => {
    const at = (d: number) => BIOLAC_FEEDING_GUIDE.find((r) => r.ageDays === d)!;
    expect(at(1)).toMatchObject({ forearmMm: 57.5, weightGrams: 71, dailyMl: 18, feedsMin: 5 });
    expect(at(28)).toMatchObject({ forearmMm: 89, weightGrams: 122, dailyMl: 31, feedsMin: 4 });
    expect(at(63)).toMatchObject({ forearmMm: 119, weightGrams: 244, dailyMl: 60, feedsMin: 4 });
    expect(at(77)).toMatchObject({ dailyMl: 15, feedsMin: 1, feedsMax: 2 });
    expect(at(84).dailyMl).toBeNull();
  });

  it('matches its 25%-of-weight basis at the start', () => {
    // 100 g pup ~ 25 mL/day per Biolac; day 21 is 104 g / 26 mL.
    const r = BIOLAC_FEEDING_GUIDE.find((x) => x.ageDays === 21)!;
    expect(r.dailyMl! / r.weightGrams).toBeCloseTo(0.25, 2);
  });

  it('totals close to the manual’s 2,930 mL from day 1 to weaning', () => {
    let total = 0;
    for (let d = 1; d < 84; d++) total += interpolateChart('age', d)!.dailyMl ?? 0;
    // Weekly table interpolated day by day; within 5% of the manual's total.
    expect(Math.abs(total - 2930) / 2930).toBeLessThan(0.05);
  });
});

describe('interpolateChart', () => {
  it('interpolates between weekly rows by forearm', () => {
    // 67 mm: between 65 (20 mL) and 73.5 (22 mL), 2/8.5 of the way.
    const p = interpolateChart('forearm', 67)!;
    expect(p.dailyMl).toBe(20.5);
    expect(p.feedsMin).toBe(5);
    expect(p.ageDays).toBe(9);
  });

  it('steps feeds per day with the row reached', () => {
    expect(interpolateChart('age', 30)!.feedsMin).toBe(4);
  });

  it('tapers milk to zero between 11 and 12 weeks', () => {
    const p = interpolateChart('age', 80)!;
    expect(p.dailyMl).toBeGreaterThan(0);
    expect(p.dailyMl).toBeLessThan(15);
    expect(interpolateChart('age', 84)!.weaned).toBe(true);
  });

  it('clamps and flags values off the chart', () => {
    expect(interpolateChart('forearm', 50)!.clamped).toBe(true);
    expect(interpolateChart('forearm', 140)!.clamped).toBe(true);
    expect(interpolateChart('forearm', 57.5)!.clamped).toBe(false);
  });

  it('rejects nonsense input', () => {
    expect(interpolateChart('age', -1)).toBeNull();
    expect(interpolateChart('forearm', Number.NaN)).toBeNull();
  });
});

describe('calculateChartFeed', () => {
  it('Biolac: day total, per feed and powder at 14 g to 70 mL', () => {
    const p = calculateChartFeed({ formula: 'biolac-flying-fox', by: 'forearm', value: 89 })!;
    expect(p.dailyMl).toBe(31);
    expect(p.perFeedMinMl).toBe(7.8);
    expect(p.powderGrams).toBe(6.2);
    expect(p.volumeIsDerived).toBe(false);
  });

  it('Biolac Plus uses the same volumes and says when to switch', () => {
    const std = calculateChartFeed({ formula: 'biolac-flying-fox', by: 'forearm', value: 74 })!;
    const plus = calculateChartFeed({ formula: 'biolac-flying-fox-plus', by: 'forearm', value: 74 })!;
    expect(plus.dailyMl).toBe(std.dailyMl);
    expect(plus.notes[0]).toMatch(/GOS/);
  });

  it("goat's milk scales Biolac by the manual's 3,363/2,930 totals and scales the recipe", () => {
    expect(GOATS_MILK_VOLUME_FACTOR).toBeCloseTo(1.148, 3);
    const p = calculateChartFeed({ formula: 'goats-milk', by: 'forearm', value: 89 })!;
    expect(p.dailyMl).toBe(36); // 31 x 1.148 = 35.6
    expect(p.volumeIsDerived).toBe(true);
    expect(p.goatsMilk).toEqual({ milkMl: 36, glucoseGrams: 1.3, calciumSyrupMl: 0.4 });
    expect(p.powderGrams).toBeNull();
    expect(p.mixing.join(' ')).toMatch(/goat/i);
  });

  it('shows a range per feed when the chart gives 1-2 feeds', () => {
    const p = calculateChartFeed({ formula: 'biolac-flying-fox', by: 'age', value: 77 })!;
    expect(p.perFeedMinMl).toBe(7.5);
    expect(p.perFeedMaxMl).toBe(15);
  });

  it('no milk once weaned', () => {
    const p = calculateChartFeed({ formula: 'goats-milk', by: 'age', value: 90 })!;
    expect(p.dailyMl).toBeNull();
    expect(p.goatsMilk).toBeNull();
    expect(p.notes[0]).toMatch(/Weaned/);
  });
});

describe('little reds', () => {
  it('offers up to 10% of body weight per feed', () => {
    expect(littleRedAdLibPerFeedMl(60)).toBe(6);
    expect(littleRedAdLibPerFeedMl(0)).toBeNull();
  });
});
