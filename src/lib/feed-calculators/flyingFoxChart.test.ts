import { describe, expect, it } from 'vitest';
import * as chart from './flyingFoxChart';
import { calculateChartFeed, cowsChartRowForWeight } from './flyingFoxChart';

/**
 * Pins the calculator to what Biolac actually publish (checked against the raw
 * product pages): 20-25% of body weight per day, 4-5 feeds, 14 g made up to
 * 70 mL, and "a 100g pup should take around 25mL per day".
 */
describe('Biolac Flying Fox / Plus', () => {
  it("matches Biolac's own worked example: 100 g pup, about 25 mL per DAY", () => {
    const p = calculateChartFeed({ formula: 'biolac-flying-fox', bodyWeightGrams: 100 })!;
    expect(p.dailyMinMl).toBe(20);
    expect(p.dailyMaxMl).toBe(25);
    expect(p.feedsMin).toBe(4);
    expect(p.feedsMax).toBe(5);
    expect(p.perFeedMinMl).toBe(4); // 20 mL over 5 feeds
    expect(p.perFeedMaxMl).toBe(6.3); // 25 mL over 4 feeds
    expect(p.powderGrams).toBe(5); // 25 mL at 14 g per 70 mL
  });

  it('scales with weight, so different pups get different volumes', () => {
    const a = calculateChartFeed({ formula: 'biolac-flying-fox', bodyWeightGrams: 93 })!;
    const b = calculateChartFeed({ formula: 'biolac-flying-fox', bodyWeightGrams: 200 })!;
    expect(a.dailyMaxMl).toBe(23.3);
    expect(b.dailyMaxMl).toBe(50);
  });

  it('Plus uses the same published rate and says when to switch', () => {
    const std = calculateChartFeed({ formula: 'biolac-flying-fox', bodyWeightGrams: 109 })!;
    const plus = calculateChartFeed({ formula: 'biolac-flying-fox-plus', bodyWeightGrams: 109 })!;
    expect(plus.dailyMaxMl).toBe(std.dailyMaxMl);
    expect(plus.notes[0]).toMatch(/GOS/);
    expect(plus.notes[0]).toMatch(/no transition/);
  });

  it('carries no age/forearm chart (Biolac publish none)', () => {
    expect(Object.keys(chart)).not.toContain('BIOLAC_FEEDING_GUIDE');
    expect(Object.keys(chart)).not.toContain('interpolateChart');
  });

  it('rejects missing or nonsense weights', () => {
    expect(calculateChartFeed({ formula: 'biolac-flying-fox', bodyWeightGrams: 0 })).toBeNull();
    expect(calculateChartFeed({ formula: 'biolac-flying-fox', bodyWeightGrams: Number.NaN })).toBeNull();
  });
});

describe("goat's milk: Pinson & Kerr cow's milk chart, read by weight", () => {
  it('reads the last chart row at or below the weight (Manual 3.026 method)', () => {
    expect(cowsChartRowForWeight(71)).toMatchObject({ chartDay: 1, dailyMl: 23, schedule: [4, 4, 5, 5, 5] });
    expect(cowsChartRowForWeight(76)).toMatchObject({ chartDay: 6, dailyMl: 26, schedule: [5, 5, 5, 5, 6] });
    expect(cowsChartRowForWeight(93)).toMatchObject({ chartDay: 16, dailyMl: 33, schedule: [6, 6, 7, 7, 7] });
    expect(cowsChartRowForWeight(109)).toMatchObject({ chartDay: 23, dailyMl: 38, schedule: [7, 7, 8, 8, 8] });
    expect(cowsChartRowForWeight(122)).toMatchObject({ chartDay: 28, dailyMl: 41, schedule: [10, 10, 10, 11] });
  });

  it('flags weights below the chart, and weaned weights', () => {
    expect(cowsChartRowForWeight(60)).toMatchObject({ chartDay: 1, belowChart: true });
    expect(cowsChartRowForWeight(310)).toMatchObject({ weaned: true, dailyMl: 0 });
  });

  it('calculator plan uses the chart figures, not a derived rate', () => {
    const p = calculateChartFeed({ formula: 'goats-milk', bodyWeightGrams: 93 })!;
    expect(p).toMatchObject({ dailyMinMl: 33, dailyMaxMl: 33, feedsMin: 5, feedsMax: 5, schedule: [6, 6, 7, 7, 7], volumeIsDerived: false });
    expect(p.powderGrams).toBeNull();
    // 33 mL at 3.5 g Glucodin and 1 mL calcium syrup per 100 mL.
    expect(p.goatsMilk).toEqual({ milkMl: 33, glucoseGrams: 1.2, calciumSyrupMl: 0.3 });
    expect(p.notes.join(' ')).toMatch(/cow's milk chart/);
    expect(p.notes.join(' ')).not.toMatch(/DERIVED/);
  });
});

describe('little reds', () => {
  it('adds the manual ad-lib guidance of up to 10% body weight per feed', () => {
    const p = calculateChartFeed({ formula: 'biolac-flying-fox', bodyWeightGrams: 60, species: 'little-red' })!;
    expect(p.notes[0]).toMatch(/6 mL per feed/);
  });
});
