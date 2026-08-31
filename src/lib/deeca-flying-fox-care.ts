/**
 * Grey-headed and little red flying fox care timeline.
 *
 * SOURCE
 * Victorian Wildlife Rehabilitation Guidelines, Part B Chapter 4 (Flying
 * Foxes), DEECA 2023. Table 4.7 (grey-headed feeding and housing), Table 4.8
 * (little red development), Table 4.1 (species profiles), Section 4.9
 * (release protocol).
 * https://www.wildlife.vic.gov.au/__data/assets/pdf_file/0025/671245/Part-B-Mammals-Chapter-4.pdf
 *
 * This is DEECA's own guidance for Victorian rehabilitators, so it is the
 * authority for a Victorian shelter and should be preferred over any other
 * growth reference in this codebase where the two disagree.
 *
 * KNOWN CONFLICT WITH THE SEEDED GROWTH REFERENCE DATA
 * prisma/growth-reference-seed-data.ts cites Divljan 2006 / Hall & Richards
 * 2000 and puts grey-headed flying fox birth weight at ~25 g. DEECA's Table
 * 4.7 puts a newborn at 85 g, and 85 g is consistent with the published adult
 * range and with flying foxes being born large. The seeded curve appears to be
 * wrong for weight.
 *
 * The practical consequence: on the seeded curve an 85 g pup interpolates to
 * roughly 24 days old, so a genuine newborn would be aged three and a half
 * weeks too old, and its estimated birth date, feed schedule and release
 * timing would all shift with it. Forearm lengths in the two sources agree far
 * more closely, which is a further reason to prefer forearm for ageing
 * flying foxes.
 *
 * Until the seed data is corrected, treat this module as authoritative for
 * flying foxes.
 */

export interface FlyingFoxCareStage {
  /** Weeks since birth. 0 = newborn. */
  ageWeeks: number;
  weightGrams: number;
  forearmMm: number;
  /** Millilitres of milk per feed, where still milk-dependent. */
  milkMlPerFeed?: number;
  feedsPerDayMin?: number;
  feedsPerDayMax?: number;
  /** Solid food guidance for this week, verbatim in substance from Table 4.7. */
  solids?: string;
  /** Brooder/heat-pad temperature in °C, or null once heat is withdrawn. */
  temperatureC?: string | null;
  housing?: string;
  milestone?: string;
}

/**
 * Table 4.7 — grey-headed flying fox. Note this table is NOT split by sex:
 * DEECA give a single set of figures for the whole hand-rearing period,
 * because sexual size dimorphism has not emerged at these ages (see
 * FLYING_FOX_MATURITY below).
 */
export const GHFF_CARE_TIMELINE: FlyingFoxCareStage[] = [
  {
    ageWeeks: 0,
    weightGrams: 85,
    forearmMm: 57,
    milkMlPerFeed: 4,
    feedsPerDayMin: 5,
    feedsPerDayMax: 5,
    temperatureC: '30–32',
    housing:
      'Up to 4 orphans in 1 m x 0.5 m x 0.6 m Rio or cane basket. Wrapped in mumma wraps. Clean wings daily.',
    milestone: 'Toilet after each feed until 4–6 weeks old.',
  },
  { ageWeeks: 1, weightGrams: 99, forearmMm: 69, milkMlPerFeed: 5, feedsPerDayMin: 5, feedsPerDayMax: 5, temperatureC: '30–32' },
  { ageWeeks: 2, weightGrams: 117, forearmMm: 79, milkMlPerFeed: 6, feedsPerDayMin: 5, feedsPerDayMax: 5, temperatureC: '28' },
  { ageWeeks: 3, weightGrams: 133, forearmMm: 87, milkMlPerFeed: 7, feedsPerDayMin: 4, feedsPerDayMax: 5, temperatureC: '28' },
  {
    ageWeeks: 4,
    weightGrams: 150,
    forearmMm: 93,
    milkMlPerFeed: 10,
    feedsPerDayMin: 4,
    feedsPerDayMax: 4,
    temperatureC: '28',
    housing:
      'Two pups in 1 m x 1 m x 1 m — large enough to hang, move and flap. Mesh dome tent, canvas carrier or dog crate. Offer natural enrichment; avoid plastic toys.',
  },
  {
    ageWeeks: 5,
    weightGrams: 167,
    forearmMm: 99,
    milkMlPerFeed: 11,
    feedsPerDayMin: 4,
    feedsPerDayMax: 4,
    temperatureC: null,
    milestone: 'No artificial heat from five weeks.',
  },
  { ageWeeks: 6, weightGrams: 184, forearmMm: 104, milkMlPerFeed: 12, feedsPerDayMin: 4, feedsPerDayMax: 4, temperatureC: null },
  {
    ageWeeks: 7,
    weightGrams: 201,
    forearmMm: 109,
    milkMlPerFeed: 13,
    feedsPerDayMin: 4,
    feedsPerDayMax: 4,
    solids: 'Introduce fruit — steamed, peeled apple, 2–4 pieces after feed.',
    temperatureC: null,
    milestone: 'First solids.',
  },
  { ageWeeks: 8, weightGrams: 217, forearmMm: 114, milkMlPerFeed: 13, feedsPerDayMin: 4, feedsPerDayMax: 4, solids: 'Steamed apple with peel on. Offer 50 g/day.', temperatureC: null },
  { ageWeeks: 9, weightGrams: 235, forearmMm: 118, milkMlPerFeed: 14, feedsPerDayMin: 4, feedsPerDayMax: 4, solids: 'Up to 3 fruit types — 2/3 apple, 1/3 other. Eating 50–100 g/day.', temperatureC: null },
  { ageWeeks: 10, weightGrams: 252, forearmMm: 122, milkMlPerFeed: 15, feedsPerDayMin: 3, feedsPerDayMax: 4, solids: 'Fruit ½ steamed, ½ raw. Increase by 25 g if eaten. Offer 100–200 g/day.', temperatureC: null },
  { ageWeeks: 11, weightGrams: 269, forearmMm: 125, milkMlPerFeed: 15, feedsPerDayMin: 1, feedsPerDayMax: 2, temperatureC: null },
  {
    ageWeeks: 12,
    weightGrams: 286,
    forearmMm: 129,
    solids: 'Offer more than 250 g fruit in the evening.',
    temperatureC: null,
    milestone: 'Wean. Place in crèche with other juveniles once making first attempts at independent flight.',
  },
  { ageWeeks: 13, weightGrams: 302, forearmMm: 132, solids: 'Offer 250–300 g fruit in the evening.', temperatureC: null, housing: 'Crèche: 10–20 young in 20 m² x 2 m; 20–50 young in 30 m² x 2 m. Minimum three weeks in crèche.' },
  { ageWeeks: 14, weightGrams: 319, forearmMm: 136, temperatureC: null },
  { ageWeeks: 15, weightGrams: 336, forearmMm: 139, solids: 'Offer 300–350 g fruit in the evening.', temperatureC: null, milestone: 'Earliest soft release age — must also have spent at least three weeks in a crèche.' },
  { ageWeeks: 16, weightGrams: 353, forearmMm: 143, temperatureC: null },
];

/** Table 4.8 — little red flying fox. Weight and forearm only. */
export const LITTLE_RED_TIMELINE: Pick<
  FlyingFoxCareStage,
  'ageWeeks' | 'weightGrams' | 'forearmMm'
>[] = [
  { ageWeeks: 0, weightGrams: 41, forearmMm: 45 },
  { ageWeeks: 1, weightGrams: 49, forearmMm: 50 },
  { ageWeeks: 2, weightGrams: 59, forearmMm: 55 },
  { ageWeeks: 3, weightGrams: 68, forearmMm: 61 },
  { ageWeeks: 4, weightGrams: 79, forearmMm: 66 },
  { ageWeeks: 5, weightGrams: 89, forearmMm: 71 },
  { ageWeeks: 6, weightGrams: 100, forearmMm: 75 },
  { ageWeeks: 7, weightGrams: 111, forearmMm: 80 },
  { ageWeeks: 8, weightGrams: 122, forearmMm: 83 },
  { ageWeeks: 9, weightGrams: 133, forearmMm: 87 },
  { ageWeeks: 10, weightGrams: 145, forearmMm: 90 },
  { ageWeeks: 11, weightGrams: 157, forearmMm: 93 },
  { ageWeeks: 12, weightGrams: 169, forearmMm: 96 },
  { ageWeeks: 13, weightGrams: 182, forearmMm: 98 },
  { ageWeeks: 14, weightGrams: 195, forearmMm: 100 },
  { ageWeeks: 15, weightGrams: 208, forearmMm: 101 },
  { ageWeeks: 16, weightGrams: 221, forearmMm: 103 },
];

/**
 * Little reds are hand raised like grey-headed flying foxes but need roughly
 * half the milk and fruit at each feed (DEECA Section 4.8.2). No separate
 * feeding table is published for them.
 */
export const LITTLE_RED_FEED_FACTOR = 0.5;

/**
 * Sexual maturity and adult size dimorphism (Table 4.1).
 *
 * This is the answer to "when does sex start to matter for size": not during
 * hand rearing. DEECA publish a single unsexed rearing table to 16 weeks
 * precisely because dimorphism has not emerged by then. Sexual maturity is
 * 24–36 months in grey-headed flying foxes — six times longer than the whole
 * rearing period — so a chart covering the rearing window has no divergence
 * point to draw.
 *
 * Where sex does matter is the adult target weight used at pre-release
 * assessment, which is why the two are given separately below.
 */
export const FLYING_FOX_MATURITY = {
  greyHeaded: {
    sexualMaturityMonthsMin: 24,
    sexualMaturityMonthsMax: 36,
    weaningMonthsMin: 5,
    weaningMonthsMax: 6,
    adultMaleMeanGrams: 842,
    adultMaleSdGrams: 11,
    adultFemaleMeanGrams: 675,
    adultFemaleSdGrams: 10,
    adultWeightRangeGrams: [600, 1100] as [number, number],
    adultForearmRangeMm: [138, 180] as [number, number],
    longevityYearsCaptive: 25,
    dimorphismReference:
      'Welbergen, J.A. 2010. Growth, bimaturation, and sexual size dimorphism in wild grey-headed flying foxes. Journal of Mammalogy 91(1) 38-47',
  },
  littleRed: {
    sexualMaturityMonthsMin: 18,
    sexualMaturityMonthsMax: 24,
    weaningMonthsMin: 5,
    weaningMonthsMax: 6,
    adultMaleWeightRangeGrams: [350, 604] as [number, number],
    adultFemaleWeightRangeGrams: [310, 560] as [number, number],
    adultMaleForearmRangeMm: [125, 156] as [number, number],
    adultFemaleForearmRangeMm: [125, 148] as [number, number],
    longevityYearsCaptive: 16,
  },
} as const;

/**
 * NOTE ON WEANING: DEECA's species table gives weaning as 5-6 months for wild
 * flying foxes, while the hand-rearing table weans at 12 weeks. These describe
 * different things — wild maternal dependency versus the hand-rearing
 * schedule — and both are reproduced here rather than reconciled.
 */

/** Pre-release assessment checklist, Section 4.9.1. */
export const FLYING_FOX_RELEASE_CHECKLIST = [
  'Presenting injury or sickness is completely resolved — consider a pre-release veterinary check.',
  'Within a healthy weight range and body condition for the species.',
  'Actively forages for and consumes natural foods.',
  'Completes a minimum of 10 laps of the pre-release enclosure without open-mouth breathing.',
  'Can invert using thumbs to urinate and defaecate, and can climb a tree trunk vertically.',
];

/** Soft release requirements for hand-reared young, Section 4.9.3. */
export const SOFT_RELEASE_REQUIREMENTS = {
  minimumAgeWeeks: 15,
  minimumCrecheWeeks: 3,
  minimumProcessWeeks: 6,
  confinementNightsBeforeHatchOpens: [7, 10] as [number, number],
  note:
    'Hand-reared pups will not survive a hard release. Soft release should happen as a group, from an enclosure within or adjacent to an occupied camp. Supplementary feeding is reduced gradually and stopped after 6-8 weeks if no animals return.',
};

/** Look up the care stage for a given age in days. */
export function getCareStageForAge(ageDays: number): FlyingFoxCareStage | null {
  if (!Number.isFinite(ageDays) || ageDays < 0) return null;
  const weeks = Math.floor(ageDays / 7);
  // Carry forward the most recent stage that has each field set, so a carer
  // at week 6 still sees the housing set at week 4.
  const upTo = GHFF_CARE_TIMELINE.filter((s) => s.ageWeeks <= weeks);
  if (upTo.length === 0) return null;
  const exact = GHFF_CARE_TIMELINE.find((s) => s.ageWeeks === weeks);
  if (!exact) return upTo[upTo.length - 1];

  const carry = <K extends keyof FlyingFoxCareStage>(key: K) => {
    for (let i = upTo.length - 1; i >= 0; i--) {
      if (upTo[i][key] !== undefined) return upTo[i][key];
    }
    return undefined;
  };

  return {
    ...exact,
    temperatureC: (carry('temperatureC') as string | null | undefined) ?? null,
    housing: exact.housing ?? (carry('housing') as string | undefined),
  };
}

/** Total millilitres of milk per day at a given stage. */
export function dailyMilkMl(stage: FlyingFoxCareStage): number | null {
  if (stage.milkMlPerFeed == null || stage.feedsPerDayMax == null) return null;
  return stage.milkMlPerFeed * stage.feedsPerDayMax;
}
