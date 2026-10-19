import { describe, expect, it } from 'vitest';
import { WOMBAROO_GHFF_CHART, wombarooChartAppliesTo, wombarooReference } from './wombaroo-ghff-chart';

describe('Wombaroo GHFF chart (Bat Rescue manual p.60)', () => {
  it('covers every day from 0 to 91', () => {
    expect(WOMBAROO_GHFF_CHART.map((r) => r[0])).toEqual(Array.from({ length: 92 }, (_, i) => i));
  });

  it('pins the printed weekly rows', () => {
    const at = (d: number) => WOMBAROO_GHFF_CHART.find((r) => r[0] === d)!;
    expect(at(0)).toEqual([0, 60, 70]);
    expect(at(7)).toEqual([7, 69, 86]); // Wk1
    expect(at(28)).toEqual([28, 91, 138]); // Wk4
    expect(at(63)).toEqual([63, 119, 234]); // Wk9
    expect(at(84)).toEqual([84, 131, 297]); // Wk12, weaned
    expect(at(91)).toEqual([91, 134, 319]); // Wk13
  });

  it('never goes backwards in weight or forearm', () => {
    for (let i = 1; i < WOMBAROO_GHFF_CHART.length; i++) {
      expect(WOMBAROO_GHFF_CHART[i][1]).toBeGreaterThanOrEqual(WOMBAROO_GHFF_CHART[i - 1][1]);
      expect(WOMBAROO_GHFF_CHART[i][2]).toBeGreaterThan(WOMBAROO_GHFF_CHART[i - 1][2]);
    }
  });

  it('maps to reference points and applies to grey-headed only', () => {
    expect(wombarooReference()[0]).toMatchObject({ ageDays: 0, weightGrams: 70, armLengthMm: 60 });
    expect(wombarooChartAppliesTo('Grey-headed Flying Fox')).toBe(true);
    expect(wombarooChartAppliesTo('Little Red Flying-fox')).toBe(false);
  });
});
