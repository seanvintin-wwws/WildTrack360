import { describe, expect, it } from 'vitest';
import { PINSON_GHFF_CHART, pinsonReference } from './pinson-ghff-chart';

describe('Pinson & Kerr Biolac chart v3 (growth columns)', () => {
  it('covers every day from 1 to 112', () => {
    expect(PINSON_GHFF_CHART.map((r) => r[0])).toEqual(Array.from({ length: 112 }, (_, i) => i + 1));
  });

  it('pins the highlighted weekly rows as printed', () => {
    const at = (d: number) => PINSON_GHFF_CHART.find((r) => r[0] === d)!;
    expect(at(1)).toEqual([1, 57.5, 71]);
    expect(at(7)).toEqual([7, 65, 78]); // 1 week
    expect(at(14)).toEqual([14, 73.5, 89]); // 2 wks
    expect(at(21)).toEqual([21, 81.5, 104]); // 3 wks
    expect(at(28)).toEqual([28, 89, 122]); // 4 wks
    expect(at(35)).toEqual([35, 96, 144]); // 5 weeks
    expect(at(42)).toEqual([42, 102, 166]); // 6 weeks
    expect(at(49)).toEqual([49, 108.5, 192]); // 7 wks
    expect(at(56)).toEqual([56, 114, 217]); // 8 weeks
    expect(at(63)).toEqual([63, 119, 244]); // 9 weeks
    expect(at(70)).toEqual([70, 123.5, 272]); // 10 wks
    expect(at(77)).toEqual([77, 127.5, 298]); // 11 wks
    expect(at(84)).toEqual([84, 131.5, 326]); // 12 wks
    expect(at(112)).toEqual([112, 142, 418]); // 16 wks
  });

  it('never goes backwards (guards against misread digits)', () => {
    for (let i = 1; i < PINSON_GHFF_CHART.length; i++) {
      const [, fa, wt] = PINSON_GHFF_CHART[i];
      const [, pfa, pwt] = PINSON_GHFF_CHART[i - 1];
      expect(fa).toBeGreaterThanOrEqual(pfa);
      expect(fa - pfa).toBeLessThanOrEqual(2);
      expect(wt).toBeGreaterThan(pwt);
      expect(wt - pwt).toBeLessThanOrEqual(6);
    }
  });

  it('maps to reference points', () => {
    expect(pinsonReference()[0]).toMatchObject({ ageDays: 1, weightGrams: 71, armLengthMm: 57.5 });
  });
});
