import { describe, expect, it } from 'vitest';
import { growthReferenceData } from '../../prisma/growth-reference-seed-data';

/**
 * These pin the flying fox reference curves to DEECA's published tables.
 *
 * The curves previously started at 25 g (grey-headed) and 18 g (little red),
 * roughly a third of DEECA's figures. Because ageing works by interpolating a
 * measurement against this curve, a genuine 85 g newborn was aged at about 24
 * days, and estimateBirthDate() placed its birth three and a half weeks early.
 * Feed volumes, age class and release timing all follow from that date.
 *
 * A wrong number here is silent — nothing errors, the chart still draws, and
 * the animal is simply managed to the wrong schedule. Hence these tests.
 */

const ghff = growthReferenceData
  .filter((r) => r.speciesName === 'Grey-headed Flying Fox')
  .sort((a, b) => a.ageDays - b.ageDays);

const littleRed = growthReferenceData
  .filter((r) => r.speciesName === 'Little Red Flying-fox')
  .sort((a, b) => a.ageDays - b.ageDays);

describe('grey-headed flying fox reference curve', () => {
  it('starts at DEECA birth weight, not the old 25g', () => {
    expect(ghff[0].weightGrams).toBe(85);
    expect(ghff[0].armLengthMm).toBe(57);
    expect(ghff[0].weightGrams).not.toBe(25);
  });

  it('matches DEECA Table 4.7 at four and twelve weeks', () => {
    const at = (days: number) => ghff.find((r) => r.ageDays === days)!;
    expect(at(28).weightGrams).toBe(150);
    expect(at(28).armLengthMm).toBe(93);
    expect(at(84).weightGrams).toBe(286);
    expect(at(84).armLengthMm).toBe(129);
  });

  it('cites DEECA as the source', () => {
    for (const row of ghff) {
      expect(row.reference).toMatch(/DEECA/);
      expect(row.reference).not.toMatch(/Divljan/);
    }
  });

  it('gives identical male and female curves, because DEECA publish one table', () => {
    // Sexual dimorphism emerges at 24-36 months, long after rearing ends.
    // Any divergence here would be invented rather than sourced.
    const f = ghff.filter((r) => r.sex === 'Female');
    const m = ghff.filter((r) => r.sex === 'Male');
    expect(f).toHaveLength(m.length);
    for (let i = 0; i < f.length; i++) {
      expect(f[i].weightGrams).toBe(m[i].weightGrams);
      expect(f[i].armLengthMm).toBe(m[i].armLengthMm);
    }
  });
});

describe('little red flying fox reference curve', () => {
  it('starts at DEECA birth weight, not the old 18g', () => {
    expect(littleRed[0].weightGrams).toBe(41);
    expect(littleRed[0].armLengthMm).toBe(45);
  });

  it('matches DEECA Table 4.8 at sixteen weeks', () => {
    const at112 = littleRed.find((r) => r.ageDays === 112)!;
    expect(at112.weightGrams).toBe(221);
    expect(at112.armLengthMm).toBe(103);
  });

  it('stays smaller than the grey-headed at every shared age', () => {
    for (const lr of littleRed.filter((r) => r.sex === 'Female')) {
      const gh = ghff.find((r) => r.sex === 'Female' && r.ageDays === lr.ageDays);
      if (gh) expect(lr.weightGrams!).toBeLessThan(gh.weightGrams!);
    }
  });
});

describe('curve integrity', () => {
  it('rises monotonically in weight and forearm for both species', () => {
    for (const set of [ghff, littleRed]) {
      for (const sex of ['Female', 'Male']) {
        const rows = set.filter((r) => r.sex === sex);
        for (let i = 1; i < rows.length; i++) {
          expect(rows[i].weightGrams!).toBeGreaterThan(rows[i - 1].weightGrams!);
          expect(rows[i].armLengthMm!).toBeGreaterThan(rows[i - 1].armLengthMm!);
        }
      }
    }
  });
});
