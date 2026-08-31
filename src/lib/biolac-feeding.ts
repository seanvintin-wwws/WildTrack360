/**
 * Biolac milk replacer feeding calculations.
 *
 * Every figure here is transcribed from Biolac's own published product pages
 * (biolac.com.au) and is cited per formula in `source` below. Nothing is
 * estimated or interpolated by this module beyond multiplying the
 * manufacturer's stated percentage of body weight by the animal's weight and
 * dividing by the stated number of feeds.
 *
 * SAFETY NOTE FOR MAINTAINERS
 * This module deliberately does NOT invent rates for formulas or species that
 * the manufacturer has not published figures for. Feeding volumes have direct
 * welfare consequences: overfeeding causes diarrhoea, bloat and aspiration.
 * If you add a formula, cite the manufacturer page it came from. If a carer
 * needs a figure that isn't published, the correct answer is to refer them to
 * their species coordinator or vet, not to interpolate.
 *
 * Output is always presented as a starting guide to be checked against the
 * animal's condition and appetite, never as a prescription.
 */

export interface BiolacFormula {
  id: string;
  name: string;
  /** What the manufacturer says this formula is for. */
  suitableFor: string;
  /** Grams of powder ... */
  powderGrams: number;
  /** ... made up to this many mL of prepared formula. */
  madeUpToMl: number;
  /** Percentage of body weight fed per day, as published. */
  percentBodyWeightMin: number;
  percentBodyWeightMax: number;
  /** Number of feeds per day, as published. */
  feedsPerDayMin: number;
  feedsPerDayMax: number;
  /** Manufacturer page this was taken from. */
  source: string;
  notes?: string[];
}

export const BIOLAC_FORMULAS: BiolacFormula[] = [
  {
    id: 'flying-fox',
    name: 'Biolac Flying Fox Formula',
    suitableFor:
      'Orphaned and rescued flying-foxes and bats. Developed from research on grey-headed flying-foxes.',
    powderGrams: 14,
    madeUpToMl: 70,
    percentBodyWeightMin: 20,
    percentBodyWeightMax: 25,
    feedsPerDayMin: 4,
    feedsPerDayMax: 5,
    source: 'biolac.com.au/products/flying-fox-formula',
    notes: [
      'This is a CONCENTRATED formula. The daily total is split across the feeds — a 100g pup takes roughly 25mL per day, not per feed.',
      'On arrival, transition gradually: 50:50 milk/water for the first feed, 75:25 for the second, full strength from the third onward.',
      'Milk-dependent period runs from rescue to weaning at around 11-12 weeks.',
      'Feed to the pup\u2019s appetite and condition. Never force-feed, and do not overfeed.',
    ],
  },
  {
    id: 'starter-100',
    name: 'Biolac Starter 100 (formerly M100)',
    suitableFor:
      'Stage 1 marsupial milk replacer for stabilised joeys. Macropods from furless to velveted, wombats 300g-1.8kg, koalas in early rearing, and possums and gliders for their entire milk-dependent period.',
    powderGrams: 16,
    madeUpToMl: 100,
    percentBodyWeightMin: 13,
    percentBodyWeightMax: 13,
    feedsPerDayMin: 6,
    feedsPerDayMax: 6,
    source: 'biolac.com.au/products/biolac-starter100-transition-milk',
    notes: [
      'Possums and gliders stay on Starter 100 through to weaning and do not progress to Stage 2 or 3.',
      'Mix powder to a smooth paste with a little pre-boiled warm water first, then add the rest.',
      'Warm in a water bath to about 32-35°C. Do not microwave.',
      'Refrigerate unused formula and use within 24 hours.',
    ],
  },
  {
    id: 'starter-100-plus',
    name: 'Biolac Starter 100 Plus (formerly M100 GOS)',
    suitableFor:
      'Stage 1 critical-care formula with added galacto-oligosaccharides (GOS) for gut health. Suited to furless joeys, neonatal possums, and animals in early stabilisation.',
    powderGrams: 16,
    madeUpToMl: 100,
    percentBodyWeightMin: 13,
    percentBodyWeightMax: 13,
    feedsPerDayMin: 6,
    feedsPerDayMax: 6,
    source: 'biolac.com.au/products/biolac-starter100plus-formula',
    notes: [
      'Recommended for the first 24 hours of care, and until the animal\u2019s eyes are open and ears nearly erect.',
      'Warm in a water bath to about 32-35°C. Do not microwave.',
    ],
  },
];

export interface FeedPlan {
  formula: BiolacFormula;
  bodyWeightGrams: number;
  /** Daily total in mL, as a range where the manufacturer publishes one. */
  dailyVolumeMinMl: number;
  dailyVolumeMaxMl: number;
  feedsPerDay: number;
  perFeedMinMl: number;
  perFeedMaxMl: number;
  /** Powder and water needed to make the daily total. */
  powderForDayGrams: number;
}

/**
 * Work out a starting feed plan. Pure arithmetic on the manufacturer's own
 * published percentages — no interpolation, no species-specific adjustment.
 */
export function calculateFeedPlan(
  formula: BiolacFormula,
  bodyWeightGrams: number,
  feedsPerDay?: number
): FeedPlan | null {
  if (!Number.isFinite(bodyWeightGrams) || bodyWeightGrams <= 0) return null;

  const feeds = feedsPerDay ?? formula.feedsPerDayMax;
  if (feeds <= 0) return null;

  const dailyMin = (bodyWeightGrams * formula.percentBodyWeightMin) / 100;
  const dailyMax = (bodyWeightGrams * formula.percentBodyWeightMax) / 100;

  const round = (n: number) => Math.round(n * 10) / 10;

  return {
    formula,
    bodyWeightGrams,
    dailyVolumeMinMl: round(dailyMin),
    dailyVolumeMaxMl: round(dailyMax),
    feedsPerDay: feeds,
    perFeedMinMl: round(dailyMin / feeds),
    perFeedMaxMl: round(dailyMax / feeds),
    // Powder needed to make the day's maximum volume, at the published ratio.
    powderForDayGrams: round(
      (dailyMax / formula.madeUpToMl) * formula.powderGrams
    ),
  };
}

export function getBiolacFormula(id: string): BiolacFormula | undefined {
  return BIOLAC_FORMULAS.find((f) => f.id === id);
}

/**
 * Formulas the manufacturer indicates for a given species, based on the
 * "suitable for" text they publish. Returns an empty array when we have no
 * published basis — callers should show all formulas and let the carer pick
 * rather than guessing.
 */
export function suggestedFormulaIds(species: string): string[] {
  const s = species.toLowerCase();
  if (s.includes('flying-fox') || s.includes('flying fox') || s.includes('bat')) {
    return ['flying-fox'];
  }
  if (
    s.includes('possum') ||
    s.includes('glider') ||
    s.includes('kangaroo') ||
    s.includes('wallaby') ||
    s.includes('wallaroo') ||
    s.includes('wombat') ||
    s.includes('koala')
  ) {
    return ['starter-100', 'starter-100-plus'];
  }
  return [];
}
