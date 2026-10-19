/**
 * Chart-based flying-fox feeding for Biolac Flying Fox, Biolac Flying Fox Plus
 * and goat's milk with additives.
 *
 * SOURCES
 * - Volumes, chart weights and feeds per day: Biolac's published weekly
 *   feeding guide for Biolac Flying Fox Milk (biolac.com.au/products/
 *   flying-fox-formula, also shown on the Flying Fox Plus page). Biolac
 *   describe it as condensed weekly values with intermediate values
 *   interpolated, which is what interpolateChart() does.
 * - Mixing: Biolac, "14 g powder made up to 70 mL" (both products, as
 *   published on biolac.com.au, October 2026).
 * - Goat's milk recipe: Pinson, The Flying-fox Manual s3.021 (see
 *   ff-manual-milk-recipes.ts).
 * - Goat's milk volumes: the manual feeds goat's milk from its cow's milk
 *   chart, which is published only as an image. The manual does publish the
 *   totals: a pup raised from day 1 to weaning takes about 2,930 mL of Biolac
 *   against 3,363 mL on the cow's milk chart. Goat's milk volumes here are
 *   the Biolac volumes scaled by that ratio (x1.148). This is a derived
 *   figure, labelled as such in the UI; replace it with the chart's own
 *   values if they become available.
 *
 * The Biolac guide was developed on grey-headed flying-foxes. No chart exists
 * for little reds (manual s3.024): ad lib at up to 10% of body weight per
 * feed is OFFERED, never forced.
 *
 * Every output is a starting guide, to be read against the pup's appetite,
 * condition and weight gain.
 */

import { getRecipe, LITTLE_RED_AD_LIB_PERCENT_PER_FEED } from '../ff-manual-milk-recipes';

export type ChartFormula = 'biolac-flying-fox' | 'biolac-flying-fox-plus' | 'goats-milk';

export interface ChartRow {
  ageDays: number;
  forearmMm: number;
  weightGrams: number;
  /** Total milk per day in mL. null = weaned (no milk). */
  dailyMl: number | null;
  feedsMin: number | null;
  feedsMax: number | null;
}

/** Biolac Flying Fox weekly feeding guide, as published by Biolac. */
export const BIOLAC_FEEDING_GUIDE: ChartRow[] = [
  { ageDays: 1, forearmMm: 57.5, weightGrams: 71, dailyMl: 18, feedsMin: 5, feedsMax: 5 },
  { ageDays: 7, forearmMm: 65, weightGrams: 78, dailyMl: 20, feedsMin: 5, feedsMax: 5 },
  { ageDays: 14, forearmMm: 73.5, weightGrams: 89, dailyMl: 22, feedsMin: 5, feedsMax: 5 },
  { ageDays: 21, forearmMm: 81.5, weightGrams: 104, dailyMl: 26, feedsMin: 5, feedsMax: 5 },
  { ageDays: 28, forearmMm: 89, weightGrams: 122, dailyMl: 31, feedsMin: 4, feedsMax: 4 },
  { ageDays: 35, forearmMm: 96, weightGrams: 144, dailyMl: 36, feedsMin: 4, feedsMax: 4 },
  { ageDays: 42, forearmMm: 102, weightGrams: 166, dailyMl: 42, feedsMin: 4, feedsMax: 4 },
  { ageDays: 49, forearmMm: 108.5, weightGrams: 192, dailyMl: 48, feedsMin: 4, feedsMax: 4 },
  { ageDays: 56, forearmMm: 114, weightGrams: 217, dailyMl: 54, feedsMin: 4, feedsMax: 4 },
  { ageDays: 63, forearmMm: 119, weightGrams: 244, dailyMl: 60, feedsMin: 4, feedsMax: 4 },
  { ageDays: 70, forearmMm: 123.5, weightGrams: 272, dailyMl: 45, feedsMin: 3, feedsMax: 3 },
  { ageDays: 77, forearmMm: 127.5, weightGrams: 298, dailyMl: 15, feedsMin: 1, feedsMax: 2 },
  { ageDays: 84, forearmMm: 131.5, weightGrams: 326, dailyMl: null, feedsMin: null, feedsMax: null },
];

/** Manual s3.021 totals, day 1 to weaning: cow's milk chart vs Biolac chart. */
export const COWS_CHART_TOTAL_ML = 3363;
export const BIOLAC_CHART_TOTAL_ML = 2930;
export const GOATS_MILK_VOLUME_FACTOR = COWS_CHART_TOTAL_ML / BIOLAC_CHART_TOTAL_ML;

export const BIOLAC_POWDER_GRAMS = 14;
export const BIOLAC_MADE_UP_TO_ML = 70;

export const CHART_FORMULAS: { value: ChartFormula; label: string }[] = [
  { value: 'biolac-flying-fox', label: 'Biolac Flying Fox' },
  { value: 'biolac-flying-fox-plus', label: 'Biolac Flying Fox Plus (with GOS)' },
  { value: 'goats-milk', label: "Goat's milk with additives" },
];

export function isChartFormula(v: string): v is ChartFormula {
  return CHART_FORMULAS.some((f) => f.value === v);
}

export interface ChartPoint {
  ageDays: number;
  forearmMm: number;
  chartWeightGrams: number;
  dailyMl: number | null;
  feedsMin: number | null;
  feedsMax: number | null;
  weaned: boolean;
  /** True when the input was beyond either end of the chart and was clamped. */
  clamped: boolean;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Look a pup up on the chart by forearm (preferred: milk-for-age, with age
 * determined by forearm) or by age. Values between weekly rows are linearly
 * interpolated; feeds per day step with the row the pup has reached.
 */
export function interpolateChart(
  by: 'forearm' | 'age',
  value: number,
  chart: ChartRow[] = BIOLAC_FEEDING_GUIDE
): ChartPoint | null {
  if (!Number.isFinite(value) || value < 0) return null;
  const key = by === 'forearm' ? 'forearmMm' : 'ageDays';
  const first = chart[0];
  const last = chart[chart.length - 1];

  const fromRow = (r: ChartRow, clamped: boolean): ChartPoint => ({
    ageDays: r.ageDays,
    forearmMm: r.forearmMm,
    chartWeightGrams: r.weightGrams,
    dailyMl: r.dailyMl,
    feedsMin: r.feedsMin,
    feedsMax: r.feedsMax,
    weaned: r.dailyMl == null,
    clamped,
  });

  if (value <= first[key]) return fromRow(first, value < first[key]);
  if (value >= last[key]) return fromRow(last, value > last[key]);

  for (let i = 0; i < chart.length - 1; i++) {
    const a = chart[i];
    const b = chart[i + 1];
    if (value >= a[key] && value <= b[key]) {
      if (value === b[key]) return fromRow(b, false);
      const t = (value - a[key]) / (b[key] - a[key]);
      const lerp = (x: number, y: number) => x + t * (y - x);
      // Between the last milk row and weaning, taper to zero.
      const bMl = b.dailyMl ?? 0;
      return {
        ageDays: Math.round(lerp(a.ageDays, b.ageDays)),
        forearmMm: round1(lerp(a.forearmMm, b.forearmMm)),
        chartWeightGrams: Math.round(lerp(a.weightGrams, b.weightGrams)),
        dailyMl: a.dailyMl == null ? null : round1(lerp(a.dailyMl, bMl)),
        feedsMin: a.feedsMin,
        feedsMax: a.feedsMax,
        weaned: false,
        clamped: false,
      };
    }
  }
  return null;
}

export interface ChartFeedPlan {
  formula: ChartFormula;
  point: ChartPoint;
  dailyMl: number | null;
  /** Per feed, at the min and max feeds per day (equal when one figure is published). */
  perFeedMinMl: number | null;
  perFeedMaxMl: number | null;
  /** Biolac powder for the day's volume, at 14 g made up to 70 mL. */
  powderGrams: number | null;
  /** Goat's milk ingredients for the day's volume. */
  goatsMilk: { milkMl: number; glucoseGrams: number; calciumSyrupMl: number } | null;
  volumeIsDerived: boolean;
  mixing: string[];
  notes: string[];
  warnings: string[];
}

export function calculateChartFeed(input: {
  formula: ChartFormula;
  by: 'forearm' | 'age';
  value: number;
}): ChartFeedPlan | null {
  const point = interpolateChart(input.by, input.value);
  if (!point) return null;

  const warnings: string[] = [];
  if (point.clamped) {
    warnings.push(
      input.by === 'forearm'
        ? `Forearm is outside the chart (57.5-131.5 mm), so the nearest chart row is shown. Check the measurement, and talk to your coordinator about a pup this ${input.value < 57.5 ? 'small' : 'large'}.`
        : 'Age is outside the chart (day 1 to 12 weeks), so the nearest chart row is shown.'
    );
  }

  const isGoat = input.formula === 'goats-milk';
  const dailyMl =
    point.dailyMl == null
      ? null
      : isGoat
        ? Math.round(point.dailyMl * GOATS_MILK_VOLUME_FACTOR)
        : point.dailyMl;

  const perFeed = (feeds: number | null) =>
    dailyMl == null || !feeds ? null : round1(dailyMl / feeds);

  const recipe = getRecipe('goats-milk');
  const mixing: string[] = [];
  const notes: string[] = [];

  if (isGoat) {
    mixing.push(...(recipe?.ingredients ?? []));
    if (recipe?.storage) mixing.push(recipe.storage);
    notes.push(
      "Volumes are derived: the Flying-fox Manual feeds goat's milk from its cow's milk chart (published as an image only). They are the Biolac volumes scaled by the manual's published totals, 3,363 mL vs 2,930 mL from day 1 to weaning (about 15% more). Check against the printed cow's milk chart."
    );
    notes.push(
      "Use only soluble calcium syrup (Troy or Novartis, 22 mg/mL). Powdered calcium is mostly insoluble and passes straight through."
    );
    notes.push(...(recipe?.notes?.slice(0, 2) ?? []));
  } else {
    mixing.push(
      `${BIOLAC_POWDER_GRAMS} g powder made up to ${BIOLAC_MADE_UP_TO_ML} mL with pre-boiled water. Mix to a smooth paste with a little warm water first, then make up to volume.`,
      'Warm in a water bath to about 32-35°C. Do not microwave.',
      'Refrigerate made-up formula and use within 24 hours. Once opened, use powder within 3 months.'
    );
    notes.push(
      'On arrival: 50:50 milk to water for the first feed, 75:25 for the second, full strength from the third.',
      'Concentrated formula: the daily total is split across the feeds. Do not overfeed.'
    );
    if (input.formula === 'biolac-flying-fox-plus') {
      notes.unshift(
        'Plus adds galacto-oligosaccharides (GOS) for gut health. For very young pups, compromised animals and new arrivals; move to standard Biolac Flying Fox once stable, feeding well and tolerating it. Same mix and volumes.'
      );
    }
    notes.push(
      "Mixing note: Biolac's instruction is 14 g made up TO 70 mL. The Flying-fox Manual adds 14 g to 70 mL of water (about 84 mL), which is weaker. This calculator follows the manufacturer."
    );
  }

  if (point.weaned) {
    notes.unshift('Weaned on the chart: no milk listed from 12 weeks.');
  }

  return {
    formula: input.formula,
    point,
    dailyMl,
    perFeedMinMl: perFeed(point.feedsMax),
    perFeedMaxMl: perFeed(point.feedsMin),
    powderGrams:
      !isGoat && dailyMl != null
        ? round1((dailyMl / BIOLAC_MADE_UP_TO_ML) * BIOLAC_POWDER_GRAMS)
        : null,
    goatsMilk:
      isGoat && dailyMl != null
        ? {
            milkMl: dailyMl,
            glucoseGrams: round1((dailyMl / 100) * 3.5),
            calciumSyrupMl: round1(dailyMl / 100),
          }
        : null,
    volumeIsDerived: isGoat,
    mixing,
    notes,
    warnings,
  };
}

/** Little reds have no chart: offer up to 10% of body weight per feed. */
export function littleRedAdLibPerFeedMl(bodyWeightGrams: number): number | null {
  if (!Number.isFinite(bodyWeightGrams) || bodyWeightGrams <= 0) return null;
  return round1((bodyWeightGrams * LITTLE_RED_AD_LIB_PERCENT_PER_FEED) / 100);
}
