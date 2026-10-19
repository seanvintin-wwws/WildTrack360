import { describe, expect, it } from 'vitest';
import { growthReferenceData } from '../../prisma/growth-reference-seed-data';
import {
  type ComparisonAnimal,
  type ReferenceRow,
  buildExpectedCurve,
  buildSeries,
  referenceForSex,
  resolveBirthDate,
  sexCurvesIdentical,
  summariseAnimal,
} from './growth-comparison';

const ghffRows = growthReferenceData.filter(
  (r) => r.speciesName === 'Grey-headed Flying Fox'
) as unknown as ReferenceRow[];
const ghff = referenceForSex(ghffRows, 'Male');

// Measurements are stored at local (AEDT) midnight, i.e. 13:00 UTC the day before.
const bubbles: ComparisonAnimal = {
  id: 'bubbles',
  name: 'Bubbles',
  orgAnimalId: 'ORG-2026-0096',
  sex: 'Male',
  status: 'IN_CARE',
  dateOfBirth: null,
  measurements: [
    { date: '2026-10-12T13:00:00.000Z', weightGrams: 85, armLengthMm: 63 },
    { date: '2026-10-18T13:00:00.000Z', weightGrams: 93, armLengthMm: 67 },
  ],
};

const squeak: ComparisonAnimal = {
  id: 'squeak',
  name: 'Squeak',
  orgAnimalId: 'ORG-2026-0097',
  sex: 'Female',
  status: 'IN_CARE',
  dateOfBirth: null,
  measurements: [{ date: '2026-10-18T13:00:00.000Z', weightGrams: 109, armLengthMm: 74 }],
};

describe('reference handling', () => {
  it('treats the DEECA grey-headed curve as one curve for both sexes', () => {
    expect(sexCurvesIdentical(ghffRows)).toBe(true);
  });

  it('falls back to an available sex when the animal sex is unknown', () => {
    expect(referenceForSex(ghffRows, null).length).toBeGreaterThan(0);
  });
});

describe('resolveBirthDate', () => {
  it('uses a recorded date of birth when there is one', () => {
    const r = resolveBirthDate({ ...bubbles, dateOfBirth: '2026-10-01T13:00:00.000Z' }, ghff);
    expect(r?.estimated).toBe(false);
    expect(r?.date.toISOString()).toBe('2026-10-01T13:00:00.000Z');
  });

  it('ages from the earliest forearm, not weight', () => {
    // 63 mm sits halfway between DEECA's 57 mm (day 0) and 69 mm (day 7): day 4 after rounding.
    const r = resolveBirthDate(bubbles, ghff)!;
    expect(r.estimated).toBe(true);
    expect(r.basis).toContain('forearm 63 mm');
    expect(r.date.toISOString()).toBe('2026-10-08T13:00:00.000Z');
    expect(r.outsideReference).toBe(false);
  });

  it('falls back to weight when no forearm was recorded', () => {
    const r = resolveBirthDate(
      { ...bubbles, measurements: [{ date: '2026-10-12T13:00:00.000Z', weightGrams: 85, armLengthMm: null }] },
      ghff
    )!;
    expect(r.basis).toContain('weight 85 g');
    expect(r.date.toISOString()).toBe('2026-10-12T13:00:00.000Z');
  });

  it('returns null when there is nothing to age from', () => {
    expect(resolveBirthDate({ ...bubbles, measurements: [] }, ghff)).toBeNull();
  });

  it('flags a measurement outside the reference range', () => {
    const r = resolveBirthDate(
      { ...bubbles, measurements: [{ date: '2026-10-12T13:00:00.000Z', weightGrams: null, armLengthMm: 50 }] },
      ghff
    )!;
    expect(r.outsideReference).toBe(true);
  });
});

describe('buildSeries', () => {
  it('places each measurement at its age in days', () => {
    const birth = resolveBirthDate(bubbles, ghff)!.date;
    expect(buildSeries(bubbles, birth, 'weightGrams').map((p) => [p.ageDays, p.value])).toEqual([
      [4, 85],
      [10, 93],
    ]);
    expect(buildSeries(bubbles, birth, 'armLengthMm').map((p) => [p.ageDays, p.value])).toEqual([
      [4, 63],
      [10, 67],
    ]);
  });
});

describe('buildExpectedCurve', () => {
  it('starts at DEECA birth values and runs past the oldest animal', () => {
    const curve = buildExpectedCurve(ghff, 'weightGrams', 10);
    expect(curve[0]).toEqual({ ageDays: 0, value: 85 });
    expect(curve[curve.length - 1].ageDays).toBe(28);
  });
});

describe('summariseAnimal', () => {
  const today = new Date('2026-10-19T08:00:00.000Z');

  it('flags Bubbles as behind on weight at day 10', () => {
    const s = summariseAnimal(bubbles, ghff, today);
    expect(s.latestAgeDays).toBe(10);
    expect(s.ageTodayDays).toBe(11);
    // DEECA day 10 = 99 + (117-99) * 3/7 = 106.7 g
    expect(s.weight?.expected).toBe(106.7);
    expect(s.weight?.difference).toBe(-13.7);
    expect(s.weight?.percent).toBe(-12.8);
    expect(s.status).toBe('warning');
    // DEECA day 10 forearm = 69 + (79-69) * 3/7 = 73.3 mm
    expect(s.forearm?.expected).toBe(73.3);
  });

  it('shows Squeak on track at intake', () => {
    const s = summariseAnimal(squeak, ghff, today);
    // 74 mm -> day 10.5, rounds to 11. DEECA day 11 weight = 109.3 g.
    expect(s.latestAgeDays).toBe(11);
    expect(s.weight?.expected).toBe(109.3);
    expect(s.status).toBe('normal');
  });

  it('reports unknown when an animal cannot be aged', () => {
    expect(summariseAnimal({ ...squeak, measurements: [] }, ghff, today).status).toBe('unknown');
  });
});
