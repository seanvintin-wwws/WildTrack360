import { describe, expect, it } from 'vitest';
import { WOMBAROO_GHFF_CHART, wombarooChartAppliesTo, wombarooReference } from './wombaroo-ghff-chart';

// Wombaroo's published Grey-Headed Flying Fox table, every row as printed:
// [age days, arm mm, leg mm, weight g, feed mL/day]
const PRINTED: [number, number, number, number, number][] = [
  [2, 59, 31, 75, 27],
  [4, 62, 33, 79, 28],
  [8, 67, 36, 88, 30],
  [12, 72, 39, 98, 32],
  [16, 77, 41, 108, 35],
  [20, 82, 43, 118, 38],
  [24, 86, 45, 128, 40],
  [28, 90, 47, 138, 42],
  [32, 94, 48, 148, 44],
  [36, 98, 49, 159, 46],
  [40, 102, 50, 170, 48],
  [44, 105, 51, 181, 50],
  [48, 108, 52, 192, 52],
  [52, 111, 53, 203, 54],
  [56, 114, 54, 214, 57],
  [60, 117, 55, 225, 59],
  [66, 121, 56, 243, 45],
  [72, 125, 57, 261, 30],
  [78, 128, 58, 279, 15],
  [84, 131, 59, 297, 0],
];

describe("Wombaroo GHFF chart (Wombaroo's published table)", () => {
  it('matches every printed row exactly, with nothing added', () => {
    expect(WOMBAROO_GHFF_CHART).toEqual(PRINTED);
  });

  it('runs from day 2 to day 84 only', () => {
    expect(WOMBAROO_GHFF_CHART[0][0]).toBe(2);
    expect(WOMBAROO_GHFF_CHART[WOMBAROO_GHFF_CHART.length - 1][0]).toBe(84);
  });

  it('never goes backwards in forearm, leg or weight', () => {
    for (let i = 1; i < WOMBAROO_GHFF_CHART.length; i++) {
      expect(WOMBAROO_GHFF_CHART[i][0]).toBeGreaterThan(WOMBAROO_GHFF_CHART[i - 1][0]);
      expect(WOMBAROO_GHFF_CHART[i][1]).toBeGreaterThan(WOMBAROO_GHFF_CHART[i - 1][1]);
      expect(WOMBAROO_GHFF_CHART[i][2]).toBeGreaterThan(WOMBAROO_GHFF_CHART[i - 1][2]);
      expect(WOMBAROO_GHFF_CHART[i][3]).toBeGreaterThan(WOMBAROO_GHFF_CHART[i - 1][3]);
    }
  });

  it('maps to reference points with forearm, leg and weight', () => {
    expect(wombarooReference()[0]).toMatchObject({
      ageDays: 2,
      weightGrams: 75,
      armLengthMm: 59,
      legLengthMm: 31,
    });
    expect(wombarooReference().find((p) => p.ageDays === 20)).toMatchObject({
      weightGrams: 118,
      armLengthMm: 82,
    });
  });

  it('applies to grey-headed only', () => {
    expect(wombarooChartAppliesTo('Grey-headed Flying Fox')).toBe(true);
    expect(wombarooChartAppliesTo('Little Red Flying-fox')).toBe(false);
  });
});
