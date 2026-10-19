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
 * - Goat's milk volume: no published percentage exists. The manual feeds goat's
 *   milk from its cow's milk chart (an image only) and publishes the totals: a
 *   pup raised from day 1 to weaning takes about 2,930 mL of Biolac against
 *   3,363 mL on the cow's milk chart. Goat's milk here is the Biolac rate scaled
 *   by that ratio (x1.148), and is labelled as derived.
 *
 * Every output is a starting guide, read against the pup's appetite, condition
 * and weight gain.
 */

import { getRecipe, LITTLE_RED_AD_LIB_PERCENT_PER_FEED } from '../ff-manual-milk-recipes';

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

/** Manual s3.021 totals, day 1 to weaning: cow's milk chart vs Biolac chart. */
export const COWS_CHART_TOTAL_ML = 3363;
export const BIOLAC_CHART_TOTAL_ML = 2930;
export const GOATS_MILK_VOLUME_FACTOR = COWS_CHART_TOTAL_ML / BIOLAC_CHART_TOTAL_ML;

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
  const factor = isGoat ? GOATS_MILK_VOLUME_FACTOR : 1;
  const percentMin = round1(BIOLAC_PERCENT_BODY_WEIGHT_MIN * factor);
  const percentMax = round1(BIOLAC_PERCENT_BODY_WEIGHT_MAX * factor);
  const dailyMin = (w * BIOLAC_PERCENT_BODY_WEIGHT_MIN * factor) / 100;
  const dailyMax = (w * BIOLAC_PERCENT_BODY_WEIGHT_MAX * factor) / 100;

  const recipe = getRecipe('goats-milk');
  const mixing: string[] = [];
  const notes: string[] = [];

  if (isGoat) {
    mixing.push(...(recipe?.ingredients ?? []));
    if (recipe?.storage) mixing.push(recipe.storage);
    notes.push(
      "Volume is DERIVED, not published. The Flying-fox Manual feeds goat's milk from its cow's milk chart (an image only). This is Biolac's 20-25% of body weight scaled by the manual's published totals, 3,363 mL vs 2,930 mL from day 1 to weaning (about 15% more). Check against the printed cow's milk chart.",
      'Use only soluble calcium syrup (Troy or Novartis, 22 mg/mL). Powdered calcium is mostly insoluble and passes straight through.'
    );
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
    feedsMin: BIOLAC_FEEDS_PER_DAY_MIN,
    feedsMax: BIOLAC_FEEDS_PER_DAY_MAX,
    perFeedMinMl: round1(dailyMin / BIOLAC_FEEDS_PER_DAY_MAX),
    perFeedMaxMl: round1(dailyMax / BIOLAC_FEEDS_PER_DAY_MIN),
    powderGrams: isGoat ? null : round1((dailyMax / BIOLAC_MADE_UP_TO_ML) * BIOLAC_POWDER_GRAMS),
    goatsMilk: isGoat
      ? {
          milkMl: Math.round(dailyMax),
          glucoseGrams: round1((dailyMax / 100) * 3.5),
          calciumSyrupMl: round1(dailyMax / 100),
        }
      : null,
    volumeIsDerived: isGoat,
    mixing,
    notes,
  };
}
