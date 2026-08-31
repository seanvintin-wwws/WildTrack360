/**
 * Flying-fox milk replacer recipes and calcium supplementation.
 *
 * SOURCE
 * Pinson, D. The Flying-fox Manual, section 3.021 "Milk Replacement Formulas"
 * and section 3.024 "Feeding Charts". Nutritional comparison figures
 * originally from Messer & Parry-Jones (1997) and Hood et al. (2001), with
 * later additions by the author.
 *
 * The manual is copyright and asks for written consent before reproduction.
 * What is encoded here is functional: ingredient quantities, the arithmetic
 * for calcium supplementation, and published nutritional values. The author's
 * discussion, recommendations and commentary are not reproduced — carers
 * should read the manual itself for those.
 *
 * WHY CALCIUM IS THE CENTRAL PROBLEM
 * Natural flying-fox milk carries about 155.7 mg calcium per 100 mL. Human
 * infant formulas are built to match human breast milk at roughly 33 mg per
 * 100 mL, because human babies do not grow a forearm at nearly a millimetre a
 * day. Feeding an unsupplemented human formula to a flying-fox pup has caused
 * low bone density, poor bone formation, curved long bones, and pups that had
 * to be euthanased.
 *
 * The manual is emphatic that the answer is to add soluble calcium, never to
 * add more powder: quadrupling S-26 powder to reach the right calcium would
 * produce a slurry too thick for a teat, take carbohydrate to 29.2 g/100 mL
 * and fat to 14.4 g/100 mL.
 */

/** Soluble calcium syrups the manual specifies by name. */
export const CALCIUM_SYRUP = {
  /** Both Troy and Novartis carry the same soluble calcium concentration. */
  mgCalciumPerMl: 22,
  /** The syrup is also 24% pure glucose, which is why the powdered cow's milk recipe adds no separate glucose. */
  glucosePercent: 24,
  brands: ['Troy Calcium Syrup', 'Novartis Calcium Syrup (for animal use)'],
  note: 'Only fully soluble calcium is usable — calcium glubionate, gluconate, borogluconate or lactobionate. Many powdered calcium forms are insoluble, pass straight through the animal, and leave it deficient while appearing to be supplemented.',
} as const;

/** Calcium content of natural flying-fox milk, the supplementation target. */
export const FLYING_FOX_MILK_CALCIUM_MG_PER_100ML = 155.7;

export interface MilkComparison {
  name: string;
  energyKj: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calciumMg: number;
  /** True where the figures are for a made-up product rather than a raw milk. */
  isReplacer: boolean;
}

/** Per 100 mL of natural or made-up product (manual section 3.021). */
export const MILK_COMPARISON: MilkComparison[] = [
  { name: 'Flying-fox milk', energyKj: 274, proteinG: 4.0, carbsG: 7.2, fatG: 2.42, calciumMg: 155.7, isReplacer: false },
  { name: 'Biolac Flying Fox', energyKj: 450, proteinG: 4.33, carbsG: 7.17, fatG: 5.0, calciumMg: 200.0, isReplacer: true },
  { name: "Cow's milk (full cream)", energyKj: 259, proteinG: 3.4, carbsG: 4.4, fatG: 3.4, calciumMg: 118.0, isReplacer: false },
  { name: "Cow's milk + glucose", energyKj: 314, proteinG: 3.1, carbsG: 7.8, fatG: 3.5, calciumMg: 117.0, isReplacer: true },
  { name: 'Diploma milk powder', energyKj: 283, proteinG: 3.1, carbsG: 5.2, fatG: 3.8, calciumMg: 124.0, isReplacer: true },
  { name: 'Diploma + calcium syrup', energyKj: 292, proteinG: 3.1, carbsG: 6.3, fatG: 3.8, calciumMg: 174.0, isReplacer: true },
  { name: 'Di-Vetelact (dilution B)', energyKj: 420, proteinG: 4.8, carbsG: 7.4, fatG: 6.0, calciumMg: 164.0, isReplacer: true },
  { name: "Goat's milk", energyKj: 230, proteinG: 3.1, carbsG: 3.6, fatG: 3.0, calciumMg: 138.0, isReplacer: false },
  { name: 'Human breast milk (comparison only)', energyKj: 315, proteinG: 1.1, carbsG: 7.1, fatG: 4.5, calciumMg: 33.0, isReplacer: false },
  { name: 'Karicare 0-6 months', energyKj: 282, proteinG: 1.4, carbsG: 7.2, fatG: 3.5, calciumMg: 61.0, isReplacer: true },
  { name: 'Nan 2 Comfort', energyKj: 281, proteinG: 1.5, carbsG: 8.4, fatG: 3.0, calciumMg: 78.0, isReplacer: true },
  { name: "Paul's Zymil (no lactose)", energyKj: 270, proteinG: 3.4, carbsG: 4.7, fatG: 3.6, calciumMg: 125.0, isReplacer: false },
  { name: 'S-26 Gold 0-6 months', energyKj: 280, proteinG: 1.3, carbsG: 7.3, fatG: 3.6, calciumMg: 45.0, isReplacer: true },
  { name: 'Wombaroo Flying Fox', energyKj: 260, proteinG: 3.8, carbsG: 6.4, fatG: 2.4, calciumMg: 200.0, isReplacer: true },
];

export interface MilkRecipe {
  id: string;
  name: string;
  ingredients: string[];
  yieldMl: number | null;
  storage: string;
  notes?: string[];
}

export const MILK_RECIPES: MilkRecipe[] = [
  {
    id: 'goats-milk',
    name: "Goat's milk with additives",
    ingredients: [
      "100 mL full cream goat's milk",
      '3.5 g (1 level teaspoon) Glucodin powdered glucose',
      '1 mL Troy or Novartis calcium syrup',
    ],
    yieldMl: 100,
    storage: 'Store made up in the fridge until required. Draw up, warm and feed.',
    notes: [
      "More glucose is used than in the cow's milk recipe because goat's milk is lower in carbohydrate — 3.6 g/100 mL against 4.4 g in cow's milk.",
      "Goat's milk is easier to digest and rarely causes lactose intolerance: smaller fat globules, more medium-chain fatty acids, and a softer curd in the stomach than cow's milk.",
      'Commonly used as the fallback for pups intolerant of everything else.',
    ],
  },
  {
    id: 'fresh-cows-milk',
    name: "Fresh cow's milk with additives",
    ingredients: [
      "100 mL fresh full cream cow's milk",
      '1/2 level teaspoon Glucodin powdered glucose',
      '2 mL Troy or Novartis calcium syrup',
    ],
    yieldMl: 100,
    storage:
      'Keep in a clean screw-top jar in the fridge, where it lasts as long as regular milk. Refrigerate, never freeze.',
    notes: [
      'Glucose both aids absorption and sweetens — human and flying-fox milk are both sweeter than cow\u2019s milk.',
    ],
  },
  {
    id: 'powdered-cows-milk',
    name: "Powdered (dried) cow's milk with additives",
    ingredients: [
      '1 level tablespoon Diploma full cream powdered milk (or similar)',
      '3 level tablespoons cooled pre-boiled water',
      '1.5 mL Troy or Novartis calcium syrup',
    ],
    yieldMl: 60,
    storage:
      'Store in a clean screw-top jar in the fridge; discard unused after 24-48 hours. Refrigerate, never freeze.',
    notes: [
      'Yields about 60 mL against just over 100 mL for the fresh recipe, which is why less calcium syrup is added.',
      'No separate glucose is added: the calcium syrup is already 24% glucose, and powdered milks taste sweeter than fresh.',
    ],
  },
  {
    id: 'biolac-flying-fox',
    name: 'Biolac Flying Fox',
    ingredients: ['14 g Biolac Flying Fox powder', '70 mL warm to hot pre-boiled water'],
    yieldMl: 84,
    storage:
      'Refrigerate and discard unused made-up formula after 24 hours; do not freeze. Dry powder keeps refrigerated for up to a year, or frozen for 18 months.',
    notes: [
      'Mix 14 g powder with only 10 mL of the water first, to a smooth paste, then add the remaining 60 mL. Most mixing problems come from water that is too cool.',
      'Jeweller\u2019s scales accurate to 0.1 g are recommended — many kitchen scales are not accurate enough at this weight.',
      'Re-shake before drawing up: any sediment is the natural calcium component returning to suspension.',
      'No supplements are needed; it is a complete replacer.',
      'CONCENTRATION DISCREPANCY: this recipe adds 14 g to 70 mL of water for a yield of about 84 mL. Biolac\u2019s own product page instead describes 14 g made up TO 70 mL, which is a materially more concentrated mix. Confirm against the current packet before relying on either.',
    ],
  },
];

export function getRecipe(id: string): MilkRecipe | undefined {
  return MILK_RECIPES.find((r) => r.id === id);
}

export function getMilkComparison(name: string): MilkComparison | undefined {
  const n = name.toLowerCase().trim();
  return MILK_COMPARISON.find((m) => m.name.toLowerCase() === n);
}

export interface CalciumSupplementation {
  formulaName: string;
  currentCalciumMg: number;
  targetCalciumMg: number;
  shortfallMg: number;
  /** Millilitres of 22 mg/mL calcium syrup per 100 mL of made-up formula. */
  syrupMlPer100Ml: number;
  alreadyAdequate: boolean;
}

/**
 * Work out the calcium syrup needed to bring a formula up to natural
 * flying-fox milk. The manual's method: one millilitre of syrup for each
 * 22 mg of missing calcium per 100 mL.
 *
 * Worked example from the manual — Karicare 0-6 months sits at 61 mg/100 mL,
 * so the shortfall is 95 mg, and 95 / 22 gives 4.3 mL of syrup per 100 mL.
 */
export function calculateCalciumSupplement(
  formulaName: string,
  currentCalciumMgPer100Ml: number,
  targetMgPer100Ml: number = FLYING_FOX_MILK_CALCIUM_MG_PER_100ML
): CalciumSupplementation | null {
  if (!Number.isFinite(currentCalciumMgPer100Ml) || currentCalciumMgPer100Ml < 0) {
    return null;
  }
  const shortfall = targetMgPer100Ml - currentCalciumMgPer100Ml;
  const round = (n: number) => Math.round(n * 10) / 10;

  return {
    formulaName,
    currentCalciumMg: currentCalciumMgPer100Ml,
    targetCalciumMg: targetMgPer100Ml,
    shortfallMg: round(Math.max(0, shortfall)),
    syrupMlPer100Ml:
      shortfall <= 0 ? 0 : round(shortfall / CALCIUM_SYRUP.mgCalciumPerMl),
    alreadyAdequate: shortfall <= 0,
  };
}

/**
 * Daily milk volume by the manual's charting method: total daily intake is
 * 25% of optimal body weight for Biolac, divided into the day's feeds.
 * Cow's milk and human replacer charts run proportionally higher because they
 * are less concentrated.
 *
 * NOTE: the manual's actual feed charts are published as images and are not
 * encoded here. This reproduces the stated basis only, and the manual is
 * explicit that charts are a guide rather than something to follow to the
 * letter. Volumes are milk-for-age, not milk-for-weight, with age determined
 * by forearm length on intake.
 */
export const BIOLAC_DAILY_PERCENT_BODYWEIGHT = 25;

export function biolacDailyVolumeMl(optimalBodyWeightGrams: number): number | null {
  if (!Number.isFinite(optimalBodyWeightGrams) || optimalBodyWeightGrams <= 0) {
    return null;
  }
  return Math.round(
    (optimalBodyWeightGrams * BIOLAC_DAILY_PERCENT_BODYWEIGHT) / 100
  );
}

export const FEED_CHART_PROVENANCE =
  'Pinson D & Kerr C (2009) Milk Replacer Chart for Grey-headed & Black Flying-foxes. Graphed from 60 known-age pups, cross-referenced and refined against 270 hand-reared orphans, with 3-step polynomial regression applied to produce weight and forearm curves, tabulated to 20 weeks.';

/**
 * The manual notes no feed chart exists for little red flying-foxes. Several
 * sources suggest ad lib feeding at up to 10% of body weight per feed — a
 * 60 g pup would be OFFERED about 6 mL. The manual stresses "offered": do not
 * force.
 */
export const LITTLE_RED_AD_LIB_PERCENT_PER_FEED = 10;
