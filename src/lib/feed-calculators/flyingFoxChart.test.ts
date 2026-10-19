import { describe, expect, it } from 'vitest';
import * as chart from './flyingFoxChart';
import { GOATS_MILK_VOLUME_FACTOR, calculateChartFeed } from './flyingFoxChart';

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

describe("goat's milk", () => {
  it("is the Biolac rate scaled by the manual's 3,363/2,930 totals, flagged as derived", () => {
    expect(GOATS_MILK_VOLUME_FACTOR).toBeCloseTo(1.148, 3);
    const p = calculateChartFeed({ formula: 'goats-milk', bodyWeightGrams: 100 })!;
    expect(p.percentMin).toBe(23);
    expect(p.percentMax).toBe(28.7);
    expect(p.dailyMaxMl).toBe(28.7);
    expect(p.volumeIsDerived).toBe(true);
    expect(p.powderGrams).toBeNull();
    // Recipe per 100 mL: 3.5 g glucose, 1 mL calcium syrup.
    expect(p.goatsMilk).toEqual({ milkMl: 29, glucoseGrams: 1, calciumSyrupMl: 0.3 });
    expect(p.notes[0]).toMatch(/DERIVED/);
  });
});

describe('little reds', () => {
  it('adds the manual ad-lib guidance of up to 10% body weight per feed', () => {
    const p = calculateChartFeed({ formula: 'biolac-flying-fox', bodyWeightGrams: 60, species: 'little-red' })!;
    expect(p.notes[0]).toMatch(/6 mL per feed/);
  });
});
