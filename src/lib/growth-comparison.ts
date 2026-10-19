/**
 * Growth comparison across animals of one species, against the reference curve.
 *
 * Used by the Growth Comparison care tool to answer "is each of my pups growing
 * as expected, and how do they compare with each other?".
 *
 * Plotting against a reference curve needs an age axis, which needs a birth
 * date. Most orphans arrive without one, so where the record has no date of
 * birth we estimate it from the earliest measurement, the same way the
 * existing birth-date estimator does. For flying foxes we age from forearm
 * (DEECA's forearm and weight figures both start the curve, but forearm is
 * the steadier ageing measure; weight swings with hydration and feeding).
 * Every estimated date is labelled as estimated so it is never mistaken for a
 * known one.
 *
 * Note the consequence: if an animal is aged from its first forearm, that
 * first forearm point sits on the expected curve by construction. Weight, and
 * every later forearm measurement, are then genuine comparisons.
 */

import {
  type GrowthReferencePoint,
  type MeasurementField,
  interpolateAge,
  interpolateValue,
  getWFAStatus,
} from './growth-utils';

export type ComparisonMetric = 'weightGrams' | 'armLengthMm';

export const COMPARISON_METRICS: Record<ComparisonMetric, { label: string; unit: string }> = {
  weightGrams: { label: 'Weight', unit: 'g' },
  armLengthMm: { label: 'Forearm', unit: 'mm' },
};

export interface ComparisonMeasurement {
  date: string;
  weightGrams: number | null;
  armLengthMm: number | null;
}

export interface ComparisonAnimal {
  id: string;
  name: string;
  orgAnimalId: string | null;
  sex: string | null;
  status: string;
  dateOfBirth: string | null;
  measurements: ComparisonMeasurement[];
}

export interface ReferenceRow extends GrowthReferencePoint {
  sex: string;
  reference?: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

/** Reference rows for one sex, falling back to whichever sex is present. */
export function referenceForSex(rows: ReferenceRow[], sex: string | null): ReferenceRow[] {
  const wanted = sex === 'Male' || sex === 'Female' ? sex : null;
  if (wanted) {
    const match = rows.filter((r) => r.sex === wanted);
    if (match.length > 0) return match;
  }
  const firstSex = rows[0]?.sex;
  return rows.filter((r) => r.sex === firstSex);
}

/** True when every sex in the reference data has the same curve (as DEECA publish for flying foxes). */
export function sexCurvesIdentical(rows: ReferenceRow[]): boolean {
  const sexes = Array.from(new Set(rows.map((r) => r.sex)));
  if (sexes.length <= 1) return true;
  const key = (r: ReferenceRow) => `${r.ageDays}:${r.weightGrams}:${r.armLengthMm}`;
  const sets = sexes.map((s) =>
    rows
      .filter((r) => r.sex === s)
      .sort((a, b) => a.ageDays - b.ageDays)
      .map(key)
      .join('|')
  );
  return sets.every((s) => s === sets[0]);
}

export interface ResolvedBirthDate {
  date: Date;
  estimated: boolean;
  /** Plain-English basis, e.g. "estimated from forearm 63 mm on 13/10/2026". */
  basis: string;
  /** True when the ageing measurement was outside the reference range and was clamped to its edge. */
  outsideReference: boolean;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' });
}

/**
 * The animal's date of birth if recorded, otherwise an estimate from its
 * earliest forearm measurement (falling back to earliest weight).
 */
export function resolveBirthDate(
  animal: ComparisonAnimal,
  reference: GrowthReferencePoint[]
): ResolvedBirthDate | null {
  if (animal.dateOfBirth) {
    return {
      date: new Date(animal.dateOfBirth),
      estimated: false,
      basis: 'recorded date of birth',
      outsideReference: false,
    };
  }

  const sorted = [...animal.measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const ageingFields: { field: MeasurementField & ComparisonMetric; label: string; unit: string }[] = [
    { field: 'armLengthMm', label: 'forearm', unit: 'mm' },
    { field: 'weightGrams', label: 'weight', unit: 'g' },
  ];

  for (const { field, label, unit } of ageingFields) {
    const first = sorted.find((m) => m[field] != null && (m[field] as number) > 0);
    if (!first) continue;
    const value = first[field] as number;
    const ageDays = interpolateAge(reference, field, value);
    if (ageDays == null) continue;

    const points = reference.filter((p) => p[field] != null);
    const values = points.map((p) => p[field] as number);
    const outsideReference =
      values.length > 0 && (value < Math.min(...values) || value > Math.max(...values));

    const measuredOn = new Date(first.date);
    const date = new Date(measuredOn.getTime() - ageDays * DAY_MS);
    return {
      date,
      estimated: true,
      basis: `estimated from ${label} ${value} ${unit} on ${formatDate(measuredOn)}`,
      outsideReference,
    };
  }

  return null;
}

export interface SeriesPoint {
  ageDays: number;
  value: number;
  date: string;
}

/** An animal's measurements for one metric, placed on the age axis. */
export function buildSeries(
  animal: ComparisonAnimal,
  birth: Date,
  metric: ComparisonMetric
): SeriesPoint[] {
  return animal.measurements
    .filter((m) => m[metric] != null)
    .map((m) => ({
      ageDays: daysBetween(birth, new Date(m.date)),
      value: m[metric] as number,
      date: m.date,
    }))
    .filter((p) => p.ageDays >= 0)
    .sort((a, b) => a.ageDays - b.ageDays);
}

/** The reference curve for one metric, from birth to a little past the oldest plotted age. */
export function buildExpectedCurve(
  reference: GrowthReferencePoint[],
  metric: ComparisonMetric,
  maxAgeDays: number
): { ageDays: number; value: number }[] {
  const points = reference
    .filter((p) => p[metric] != null)
    .sort((a, b) => a.ageDays - b.ageDays);
  if (points.length === 0) return [];
  const limit = Math.max(maxAgeDays + 7, 28);
  const out = points
    .filter((p) => p.ageDays <= limit)
    .map((p) => ({ ageDays: p.ageDays, value: p[metric] as number }));
  // Close the curve at the limit so it doesn't stop short of the data.
  const last = out[out.length - 1];
  if (last && last.ageDays < limit && points[points.length - 1].ageDays > last.ageDays) {
    const v = interpolateValue(reference, metric, limit);
    if (v != null) out.push({ ageDays: limit, value: v });
  }
  return out;
}

export type GrowthStatus = 'normal' | 'warning' | 'danger' | 'unknown';

export interface MetricComparison {
  actual: number;
  expected: number;
  difference: number;
  percent: number;
}

/**
 * GPD (grams per day): average daily weight gain, as defined in the Bat Rescue
 * orphan training manual, i.e. weight gained over a period divided by its days.
 * Measured over the most recent week where possible: from the earliest weight
 * taken within 7 days before the latest one, else from the previous weight.
 * The expected figure is the reference curve's gain over the same ages.
 */
export interface GramsPerDay {
  actual: number;
  expected: number | null;
  days: number;
  fromDate: string;
  toDate: string;
}

export function calculateGPD(
  measurements: ComparisonMeasurement[],
  birth: Date | null,
  reference: GrowthReferencePoint[]
): GramsPerDay | null {
  const weights = measurements
    .filter((m) => m.weightGrams != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (weights.length < 2) return null;
  const latest = weights[weights.length - 1];
  const latestTime = new Date(latest.date).getTime();
  const earlier = weights.slice(0, -1);
  const withinWeek = earlier.filter(
    (m) => latestTime - new Date(m.date).getTime() <= 7 * DAY_MS
  );
  const from = withinWeek.length > 0 ? withinWeek[0] : earlier[earlier.length - 1];
  const days = daysBetween(new Date(from.date), new Date(latest.date));
  if (days <= 0) return null;
  const actual =
    Math.round((((latest.weightGrams as number) - (from.weightGrams as number)) / days) * 10) / 10;

  let expected: number | null = null;
  if (birth) {
    const a0 = daysBetween(birth, new Date(from.date));
    const a1 = daysBetween(birth, new Date(latest.date));
    const w0 = interpolateValue(reference, 'weightGrams', a0);
    const w1 = interpolateValue(reference, 'weightGrams', a1);
    if (w0 != null && w1 != null) expected = Math.round(((w1 - w0) / days) * 10) / 10;
  }
  return { actual, expected, days, fromDate: from.date, toDate: latest.date };
}

export interface AnimalGrowthSummary {
  animalId: string;
  birth: ResolvedBirthDate | null;
  ageTodayDays: number | null;
  latestDate: string | null;
  latestAgeDays: number | null;
  weight: MetricComparison | null;
  forearm: MetricComparison | null;
  /** WFA (weight for age): actual weight minus expected weight for that age, in grams. */
  wfaGrams: number | null;
  gpd: GramsPerDay | null;
  /** Based on weight, using the app's existing weight-for-age thresholds (>10% below = warning, >20% = danger). */
  status: GrowthStatus;
}

function compare(
  reference: GrowthReferencePoint[],
  metric: ComparisonMetric,
  ageDays: number,
  actual: number
): MetricComparison | null {
  const expected = interpolateValue(reference, metric, ageDays);
  if (expected == null || expected <= 0) return null;
  const difference = Math.round((actual - expected) * 10) / 10;
  const percent = Math.round((difference / expected) * 1000) / 10;
  return { actual, expected, difference, percent };
}

/** Latest measurement versus the expected value at that age. */
export function summariseAnimal(
  animal: ComparisonAnimal,
  reference: GrowthReferencePoint[],
  today: Date = new Date()
): AnimalGrowthSummary {
  const birth = resolveBirthDate(animal, reference);
  const empty: AnimalGrowthSummary = {
    animalId: animal.id,
    birth,
    ageTodayDays: null,
    latestDate: null,
    latestAgeDays: null,
    weight: null,
    forearm: null,
    wfaGrams: null,
    gpd: null,
    status: 'unknown',
  };
  if (!birth) return empty;

  const ageTodayDays = daysBetween(birth.date, today);
  const sorted = [...animal.measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latest = sorted.find((m) => m.weightGrams != null || m.armLengthMm != null);
  if (!latest) return { ...empty, ageTodayDays };

  const latestAgeDays = daysBetween(birth.date, new Date(latest.date));
  const latestWeight = sorted.find((m) => m.weightGrams != null);
  const latestForearm = sorted.find((m) => m.armLengthMm != null);

  const weight = latestWeight
    ? compare(
        reference,
        'weightGrams',
        daysBetween(birth.date, new Date(latestWeight.date)),
        latestWeight.weightGrams as number
      )
    : null;
  const forearm = latestForearm
    ? compare(
        reference,
        'armLengthMm',
        daysBetween(birth.date, new Date(latestForearm.date)),
        latestForearm.armLengthMm as number
      )
    : null;

  const status: GrowthStatus = weight
    ? getWFAStatus(weight.difference, weight.expected)
    : 'unknown';

  return {
    animalId: animal.id,
    birth,
    ageTodayDays,
    latestDate: latest.date,
    latestAgeDays,
    weight,
    forearm,
    wfaGrams: weight ? Math.round(weight.difference) || 0 : null,
    gpd: calculateGPD(animal.measurements, birth.date, reference),
    status,
  };
}
