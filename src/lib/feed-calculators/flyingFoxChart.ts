/**
 * Weight-based flying-fox feeding for Biolac Flying Fox, Biolac Flying Fox
 * Plus and goat's milk with additives.
 *
 * SOURCES (checked against the raw pages, 19 Oct 2026)
 * - Biolac Flying Fox and Flying Fox Plus (biolac.com.au/products/
 *   flying-fox-formula and /biolac-flying-fox-plus-formula), identical for
 *   both: "Feed 20-25% of body weight daily, divided into 4-5 feeds depending
 *   on age and development"; "A 100g pup should take around 25mL per day, not
 *   per feed"; mix "14g made up to 70mL"; arrival feeds 50:50, 75:25, then
 *   full strength; weaning around 11-12 weeks.
 *   Biolac publish NO age/forearm feeding table. An earlier version of this
 *   file carried a weekly table attributed to Biolac that does not exist on
 *   their site; it was removed. Do not reintroduce chart values without a
 *   primary source you have read yourself.
 * - Goat's milk recipe: Pinson, The Flying-fox Manual s3.021
 *   (ff-manual-milk-recipes.ts).
 * - Goat's milk volume: Pinson & Kerr's cow's milk chart (updated 1 Feb 2019),
 *   which the Flying-fox Manual s3.024 uses for goat's milk, read by WEIGHT:
 *   "All orphaned flying-foxes on receipt are fed volume of milk for their
 *   WEIGHT (not age)" (chart heading; Manual s3.026 worked example: find the
 *   pup's weight in the weight column and read the volume on that row).
 *   An earlier version scaled the Biolac rate by x1.148; that under-fed by up
 *   to 21% in the first month and was removed.
 *
 * Every output is a starting guide, read against the pup's appetite, condition
 * and weight gain.
 */

import { getRecipe, LITTLE_RED_AD_LIB_PERCENT_PER_FEED } from '../ff-manual-milk-recipes';
import { PINSON_COWS_FEED_CHART, WEANED_FROM_DAY } from '../feed-alerts';
import { PINSON_GHFF_CHART } from '../pinson-ghff-chart';

export type ChartFormula = 'biolac-flying-fox' | 'biolac-flying-fox-plus' | 'goats-milk';

export const CHART_FORMULAS: { value: ChartFormula; label: string }[] = [
  { value: 'biolac-flying-fox', label: 'Biolac Flying Fox' },
  { value: 'biolac-flying-fox-plus', label: 'Biolac Flying Fox Plus (with GOS)' },
  { value: 'goats-milk', label: "Goat's milk with additives" },
];

export function isChartFormula(v: string): v is ChartFormula {
  return CHART_FORMULAS.some((f) => f.value === v);
}

/** Biolac's published rate, identical for Flying Fox and Flying Fox Plus. */
export const BIOLAC_PERCENT_BODY_WEIGHT_MIN = 20;
export const BIOLAC_PERCENT_BODY_WEIGHT_MAX = 25;
export const BIOLAC_FEEDS_PER_DAY_MIN = 4;
export const BIOLAC_FEEDS_PER_DAY_MAX = 5;
export const BIOLAC_POWDER_GRAMS = 14;
export const BIOLAC_MADE_UP_TO_ML = 70;

/**
 * Cow's milk chart row for a pup's weight: the last chart day whose weight is
 * at or below the pup's weight (Manual s3.026: "going back up to 76 gram in
 * the weight column - and then reading the feeding volume next to it").
 */
export function cowsChartRowForWeight(weightGrams: number): {
  chartDay: number;
  chartWeight: number;
  dailyMl: number;
  schedule: number[];
  belowChart: boolean;
  weaned: boolean;
} | null {
  if (!Number.isFinite(weightGrams) || weightGrams <= 0) return null;
  const first = PINSON_GHFF_CHART[0];
  let row = first;
  for (const r of PINSON_GHFF_CHART) {
    if (r[2] <= weightGrams) row = r;
    else break;
  }
  const [chartDay, , chartWeight] = row;
  if (chartDay >= WEANED_FROM_DAY) {
    return { chartDay, chartWeight, dailyMl: 0, schedule: [], belowChart: false, weaned: true };
  }
  const feed = PINSON_COWS_FEED_CHART.find((f) => f[0] === chartDay)!;
  return { chartDay, chartWeight, dailyMl: feed[1], schedule: [...feed[2]], belowChart: weightGrams < first[2], weaned: false };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export interface ChartFeedPlan {
  formula: ChartFormula;
  bodyWeightGrams: number;
  /** Percent of body weight per day used for the min and max figures. */
  percentMin: number;
  percentMax: number;
  dailyMinMl: number;
  dailyMaxMl: number;
  feedsMin: number;
  feedsMax: number;
  /** Smallest per-feed figure (low daily rate over the most feeds) and largest (high rate over the fewest). */
  perFeedMinMl: number;
  perFeedMaxMl: number;
  /** Biolac powder to make the day's maximum, at 14 g made up to 70 mL. */
  powderGrams: number | null;
  /** Goat's milk ingredients for the day's maximum. */
  goatsMilk: { milkMl: number; glucoseGrams: number; calciumSyrupMl: number } | null;
  /** Per-feed amounts, earliest feed first, when read from a chart. */
  schedule: number[] | null;
  /** The chart row used (goat's milk only). */
  chartDay: number | null;
  chartWeight: number | null;
  weaned: boolean;
  volumeIsDerived: boolean;
  mixing: string[];
  notes: string[];
}

export function calculateChartFeed(input: {
  formula: ChartFormula;
  bodyWeightGrams: number;
  species?: 'grey-headed' | 'little-red';
}): ChartFeedPlan | null {
  const w = input.bodyWeightGrams;
  if (!Number.isFinite(w) || w <= 0) return null;

  const isGoat = input.formula === 'goats-milk';
  const goatRow = isGoat ? cowsChartRowForWeight(w) : null;
  const dailyMin = goatRow ? goatRow.dailyMl : (w * BIOLAC_PERCENT_BODY_WEIGHT_MIN) / 100;
  const dailyMax = goatRow ? goatRow.dailyMl : (w * BIOLAC_PERCENT_BODY_WEIGHT_MAX) / 100;
  const percentMin = goatRow ? round1((goatRow.dailyMl / w) * 100) : BIOLAC_PERCENT_BODY_WEIGHT_MIN;
  const percentMax = goatRow ? percentMin : BIOLAC_PERCENT_BODY_WEIGHT_MAX;

  const recipe = getRecipe('goats-milk');
  const mixing: string[] = [];
  const notes: string[] = [];

  if (isGoat) {
    mixing.push(...(recipe?.ingredients ?? []));
    if (recipe?.storage) mixing.push(recipe.storage);
    notes.push(
      `Volume for WEIGHT from Pinson & Kerr's cow's milk chart (the chart the Flying-fox Manual uses for goat's milk): ${w} g reads the ${goatRow!.chartWeight} g row (chart day ${goatRow!.chartDay}). This is the on-arrival volume. Once settled, move to milk-for-age from the intake forearm; all pups should be on milk-for-age by the end of their second week in care (Manual 3.026).`,
      'Use only soluble calcium syrup (Troy or Vetsense, 22 mg/mL). Powdered calcium is mostly insoluble and passes straight through.'
    );
    if (goatRow!.belowChart) notes.unshift(`Weight is below the chart's lightest row (${goatRow!.chartWeight} g), so the day 1 volume is shown. Talk to your coordinator.`);
    if (goatRow!.weaned) notes.unshift('At this weight the chart has the pup weaned: no milk.');
    notes.push(...(recipe?.notes?.slice(0, 2) ?? []));
  } else {
    mixing.push(
      `${BIOLAC_POWDER_GRAMS} g powder, then warm pre-boiled water to make up to ${BIOLAC_MADE_UP_TO_ML} mL total. Stir until fully dissolved.`,
      'Warm gently in a water bath to about 32-35°C. Do not microwave.',
      'Refrigerate made-up formula and use within 24 hours.'
    );
    if (input.formula === 'biolac-flying-fox-plus') {
      notes.push(
        'Plus adds galacto-oligosaccharides (GOS) for gut health. For very young pups, compromised animals and any flying fox newly into care. Once the pup is feeding well and its faeces are consistent for age, move to standard Biolac Flying Fox with no transition needed. Same mix and rate.'
      );
    }
    notes.push(
      'On arrival: 50:50 milk to water for the first feed, 75:25 for the second, full strength from the third.',
      'Concentrated formula: the daily total is split across the feeds (a 100 g pup takes about 25 mL per DAY). Do not overfeed; never force-feed.',
      'Milk-dependent from rescue to weaning at around 11-12 weeks.',
      "Mixing note: Biolac's instruction is 14 g made up TO 70 mL. The Flying-fox Manual adds 14 g to 70 mL of water (about 84 mL), which is weaker. This follows the manufacturer."
    );
  }

  if (input.species === 'little-red') {
    notes.unshift(
      `Little red: no feeding chart exists for this species (Flying-fox Manual s3.024). Ad lib at up to ${LITTLE_RED_AD_LIB_PERCENT_PER_FEED}% of body weight per feed is suggested: about ${round1((w * LITTLE_RED_AD_LIB_PERCENT_PER_FEED) / 100)} mL per feed for this weight. Offer, never force.`
    );
  }

  return {
    formula: input.formula,
    bodyWeightGrams: w,
    percentMin,
    percentMax,
    dailyMinMl: round1(dailyMin),
    dailyMaxMl: round1(dailyMax),
    feedsMin: goatRow ? goatRow.schedule.length : BIOLAC_FEEDS_PER_DAY_MIN,
    feedsMax: goatRow ? goatRow.schedule.length : BIOLAC_FEEDS_PER_DAY_MAX,
    perFeedMinMl: goatRow ? (goatRow.schedule.length ? Math.min(...goatRow.schedule) : 0) : round1(dailyMin / BIOLAC_FEEDS_PER_DAY_MAX),
    perFeedMaxMl: goatRow ? (goatRow.schedule.length ? Math.max(...goatRow.schedule) : 0) : round1(dailyMax / BIOLAC_FEEDS_PER_DAY_MIN),
    powderGrams: isGoat ? null : round1((dailyMax / BIOLAC_MADE_UP_TO_ML) * BIOLAC_POWDER_GRAMS),
    goatsMilk: isGoat && dailyMax > 0
      ? {
          milkMl: Math.round(dailyMax),
          glucoseGrams: round1((dailyMax / 100) * 3.5),
          calciumSyrupMl: round1(dailyMax / 100),
        }
      : null,
    schedule: goatRow ? goatRow.schedule : null,
    chartDay: goatRow ? goatRow.chartDay : null,
    chartWeight: goatRow ? goatRow.chartWeight : null,
    weaned: goatRow ? goatRow.weaned : false,
    volumeIsDerived: false,
    mixing,
    notes,
  };
}
