/**
 * Growth reference data for Australian wildlife species.
 *
 * Sources:
 * - Macropods: Poole WE et al. (1982) "Tables for age determination of the
 *   Kangaroo, Macropus giganteus, from body measurements"; ARAZPA "Birth Date
 *   Determination in Marsupials" growth charts.
 * - Possums: Kerle JA (1984) growth data for Trichosurus vulpecula; How RA
 *   (1983) growth of Pseudocheirus peregrinus.
 * - Flying Foxes: Divljan A (2006) grey-headed flying fox growth; Hall LS &
 *   Richards GC (2000) flying fox biology.
 *
 * Weight is in grams, all lengths in millimetres.
 * Data represents average values for normal healthy growth in rehabilitation.
 * Species names must match prisma/species-seed-data.ts exactly.
 */

export interface GrowthReferenceRow {
  speciesName: string;
  sex: string;
  ageDays: number;
  weightGrams: number | null;
  headLengthMm: number | null;
  earLengthMm: number | null;
  armLengthMm: number | null;
  legLengthMm: number | null;
  footLengthMm: number | null;
  tailLengthMm: number | null;
  bodyLengthMm: number | null;
  wingLengthMm: number | null;
  reference: string;
}

// Helper to generate rows for a species+sex with just weight data
function weightOnly(
  speciesName: string,
  sex: string,
  data: [number, number][],
  reference: string
): GrowthReferenceRow[] {
  return data.map(([ageDays, weightGrams]) => ({
    speciesName,
    sex,
    ageDays,
    weightGrams,
    headLengthMm: null,
    earLengthMm: null,
    armLengthMm: null,
    legLengthMm: null,
    footLengthMm: null,
    tailLengthMm: null,
    bodyLengthMm: null,
    wingLengthMm: null,
    reference,
  }));
}

// Helper for species with weight + foot length (common for macropods)
function weightAndFoot(
  speciesName: string,
  sex: string,
  data: [number, number, number][],
  reference: string
): GrowthReferenceRow[] {
  return data.map(([ageDays, weightGrams, footLengthMm]) => ({
    speciesName,
    sex,
    ageDays,
    weightGrams,
    headLengthMm: null,
    earLengthMm: null,
    armLengthMm: null,
    legLengthMm: null,
    footLengthMm,
    tailLengthMm: null,
    bodyLengthMm: null,
    wingLengthMm: null,
    reference,
  }));
}

// Helper for flying foxes with weight + arm (forearm) length
function weightAndArm(
  speciesName: string,
  sex: string,
  data: [number, number, number][],
  reference: string
): GrowthReferenceRow[] {
  return data.map(([ageDays, weightGrams, armLengthMm]) => ({
    speciesName,
    sex,
    ageDays,
    weightGrams,
    headLengthMm: null,
    earLengthMm: null,
    armLengthMm,
    legLengthMm: null,
    footLengthMm: null,
    tailLengthMm: null,
    bodyLengthMm: null,
    wingLengthMm: null,
    reference,
  }));
}

// ─── Eastern Grey Kangaroo (Macropus giganteus) ─────────────────────────────
// Poole et al. 1982, ARAZPA tables. Age 0 = birth (~0.8g, ~20mm).
// Pouch exit ~300 days. Young-at-foot to ~550 days.
const easternGreyKangarooFemale = weightAndFoot(
  'Eastern Grey Kangaroo',
  'Female',
  [
    // [ageDays, weightGrams, footLengthMm]
    [0, 1, 0],
    [20, 10, 0],
    [40, 22, 0],
    [60, 40, 8],
    [80, 65, 14],
    [100, 100, 22],
    [120, 155, 32],
    [140, 230, 44],
    [160, 340, 58],
    [180, 500, 72],
    [200, 720, 88],
    [210, 860, 96],
    [220, 1020, 104],
    [230, 1200, 113],
    [240, 1400, 122],
    [250, 1620, 131],
    [260, 1870, 140],
    [270, 2140, 150],
    [280, 2440, 160],
    [290, 2760, 170],
    [300, 3100, 180],
    [310, 3450, 190],
    [320, 3800, 199],
    [330, 4150, 208],
    [340, 4500, 216],
    [350, 4850, 224],
    [360, 5200, 231],
    [380, 5850, 244],
    [400, 6500, 255],
    [420, 7100, 264],
    [450, 7900, 276],
    [480, 8600, 285],
    [510, 9200, 292],
    [540, 9700, 297],
  ],
  'Poole et al. 1982 / ARAZPA'
);

const easternGreyKangarooMale = weightAndFoot(
  'Eastern Grey Kangaroo',
  'Male',
  [
    [0, 1, 0],
    [20, 10, 0],
    [40, 23, 0],
    [60, 42, 8],
    [80, 70, 15],
    [100, 110, 23],
    [120, 170, 34],
    [140, 260, 47],
    [160, 380, 62],
    [180, 560, 78],
    [200, 800, 95],
    [210, 960, 104],
    [220, 1140, 113],
    [230, 1350, 122],
    [240, 1580, 132],
    [250, 1840, 142],
    [260, 2130, 152],
    [270, 2450, 163],
    [280, 2800, 174],
    [290, 3180, 185],
    [300, 3580, 196],
    [310, 4000, 207],
    [320, 4430, 217],
    [330, 4880, 227],
    [340, 5340, 236],
    [350, 5800, 245],
    [360, 6280, 253],
    [380, 7200, 268],
    [400, 8100, 281],
    [420, 9000, 292],
    [450, 10200, 306],
    [480, 11400, 317],
    [510, 12500, 326],
    [540, 13500, 333],
  ],
  'Poole et al. 1982 / ARAZPA'
);

// ─── Common Wallaroo (Osphranter robustus) ──────────────────────────────────
// ARAZPA tables. Smaller than Eastern Grey. Pouch exit ~250 days.
const commonWallarooFemale = weightAndFoot(
  'Common Wallaroo',
  'Female',
  [
    [0, 1, 0],
    [30, 12, 0],
    [60, 30, 7],
    [90, 60, 16],
    [120, 110, 28],
    [150, 200, 42],
    [180, 380, 60],
    [200, 550, 72],
    [210, 660, 79],
    [220, 780, 86],
    [230, 920, 93],
    [240, 1080, 101],
    [250, 1260, 109],
    [260, 1460, 117],
    [270, 1670, 125],
    [280, 1890, 133],
    [300, 2350, 148],
    [320, 2820, 162],
    [340, 3280, 174],
    [360, 3700, 184],
    [390, 4250, 196],
    [420, 4700, 205],
    [450, 5050, 212],
  ],
  'ARAZPA'
);

const commonWallarooMale = weightAndFoot(
  'Common Wallaroo',
  'Male',
  [
    [0, 1, 0],
    [30, 13, 0],
    [60, 32, 7],
    [90, 65, 17],
    [120, 120, 30],
    [150, 220, 45],
    [180, 420, 64],
    [200, 620, 77],
    [210, 740, 84],
    [220, 880, 92],
    [230, 1040, 100],
    [240, 1220, 108],
    [250, 1420, 117],
    [260, 1650, 126],
    [270, 1900, 135],
    [280, 2170, 144],
    [300, 2750, 162],
    [320, 3380, 179],
    [340, 4020, 194],
    [360, 4680, 208],
    [390, 5600, 225],
    [420, 6500, 239],
    [450, 7300, 250],
    [480, 8000, 258],
  ],
  'ARAZPA'
);

// ─── Red-necked Wallaby (Macropus rufogriseus) ──────────────────────────────
// ARAZPA. Pouch exit ~270 days. Weaning ~360 days.
const redNeckedWallabyFemale = weightAndFoot(
  'Red-necked wallaby',
  'Female',
  [
    [0, 1, 0],
    [30, 8, 0],
    [60, 20, 6],
    [80, 35, 12],
    [100, 58, 20],
    [120, 92, 30],
    [140, 145, 42],
    [160, 225, 56],
    [180, 340, 70],
    [200, 500, 86],
    [210, 600, 94],
    [220, 710, 102],
    [230, 830, 111],
    [240, 970, 120],
    [250, 1120, 129],
    [260, 1290, 138],
    [270, 1470, 147],
    [280, 1660, 155],
    [300, 2060, 171],
    [320, 2470, 185],
    [340, 2870, 197],
    [360, 3250, 207],
    [390, 3750, 219],
    [420, 4150, 228],
    [450, 4450, 234],
  ],
  'ARAZPA'
);

const redNeckedWallabyMale = weightAndFoot(
  'Red-necked wallaby',
  'Male',
  [
    [0, 1, 0],
    [30, 9, 0],
    [60, 22, 6],
    [80, 38, 13],
    [100, 62, 21],
    [120, 100, 32],
    [140, 160, 45],
    [160, 250, 60],
    [180, 380, 76],
    [200, 560, 93],
    [210, 670, 102],
    [220, 800, 111],
    [230, 950, 120],
    [240, 1120, 130],
    [250, 1310, 140],
    [260, 1520, 150],
    [270, 1750, 160],
    [280, 2000, 170],
    [300, 2530, 189],
    [320, 3090, 206],
    [340, 3660, 221],
    [360, 4220, 234],
    [390, 5000, 250],
    [420, 5700, 262],
    [450, 6300, 271],
  ],
  'ARAZPA'
);

// ─── Swamp Wallaby (Wallabia bicolor) ───────────────────────────────────────
// ARAZPA. Pouch exit ~255 days.
const swampWallabyFemale = weightAndFoot(
  'Swamp wallaby',
  'Female',
  [
    [0, 1, 0],
    [30, 9, 0],
    [60, 22, 6],
    [80, 38, 12],
    [100, 62, 20],
    [120, 98, 30],
    [140, 155, 42],
    [160, 240, 56],
    [180, 370, 71],
    [200, 550, 88],
    [210, 660, 96],
    [220, 790, 105],
    [230, 940, 114],
    [240, 1100, 123],
    [250, 1280, 132],
    [260, 1480, 141],
    [270, 1690, 150],
    [280, 1910, 159],
    [300, 2370, 175],
    [320, 2830, 189],
    [340, 3270, 201],
    [360, 3680, 211],
    [390, 4200, 222],
    [420, 4600, 230],
  ],
  'ARAZPA'
);

const swampWallabyMale = weightAndFoot(
  'Swamp wallaby',
  'Male',
  [
    [0, 1, 0],
    [30, 10, 0],
    [60, 24, 7],
    [80, 42, 13],
    [100, 68, 22],
    [120, 110, 33],
    [140, 175, 46],
    [160, 275, 61],
    [180, 420, 78],
    [200, 630, 96],
    [210, 760, 105],
    [220, 910, 115],
    [230, 1080, 125],
    [240, 1280, 135],
    [250, 1500, 145],
    [260, 1740, 156],
    [270, 2000, 167],
    [280, 2280, 177],
    [300, 2870, 197],
    [320, 3480, 215],
    [340, 4090, 230],
    [360, 4680, 243],
    [390, 5480, 258],
    [420, 6150, 269],
    [450, 6700, 277],
  ],
  'ARAZPA'
);

// ─── Common Brushtail Possum (Trichosurus vulpecula) ────────────────────────
// Kerle 1984. Pouch exit ~150 days, weaning ~210 days.
const brushtailPossumFemale = weightOnly(
  'Common brushtail possum',
  'Female',
  [
    [0, 0.2],
    [14, 2],
    [28, 5],
    [42, 10],
    [56, 18],
    [70, 30],
    [84, 48],
    [98, 72],
    [112, 105],
    [126, 148],
    [140, 200],
    [150, 240],
    [160, 285],
    [170, 340],
    [180, 400],
    [190, 470],
    [200, 545],
    [210, 620],
    [230, 780],
    [250, 940],
    [270, 1080],
    [300, 1280],
    [330, 1450],
    [360, 1580],
  ],
  'Kerle 1984'
);

const brushtailPossumMale = weightOnly(
  'Common brushtail possum',
  'Male',
  [
    [0, 0.2],
    [14, 2],
    [28, 5],
    [42, 11],
    [56, 20],
    [70, 33],
    [84, 52],
    [98, 78],
    [112, 115],
    [126, 160],
    [140, 218],
    [150, 262],
    [160, 312],
    [170, 372],
    [180, 440],
    [190, 520],
    [200, 605],
    [210, 695],
    [230, 880],
    [250, 1070],
    [270, 1250],
    [300, 1520],
    [330, 1760],
    [360, 1950],
  ],
  'Kerle 1984'
);

// ─── Common Ringtail Possum (Pseudocheirus peregrinus) ──────────────────────
// How 1983. Pouch exit ~120 days, weaning ~180 days. Much smaller than brushtail.
const ringtailPossumFemale = weightOnly(
  'Common Ringtail Possum',
  'Female',
  [
    [0, 0.2],
    [14, 1.5],
    [28, 4],
    [42, 8],
    [56, 14],
    [70, 22],
    [84, 34],
    [98, 50],
    [112, 72],
    [120, 86],
    [130, 105],
    [140, 128],
    [150, 155],
    [160, 185],
    [170, 220],
    [180, 258],
    [200, 340],
    [220, 420],
    [240, 490],
    [270, 570],
    [300, 630],
  ],
  'How 1983'
);

const ringtailPossumMale = weightOnly(
  'Common Ringtail Possum',
  'Male',
  [
    [0, 0.2],
    [14, 1.5],
    [28, 4],
    [42, 9],
    [56, 15],
    [70, 24],
    [84, 37],
    [98, 55],
    [112, 78],
    [120, 94],
    [130, 115],
    [140, 140],
    [150, 170],
    [160, 205],
    [170, 245],
    [180, 290],
    [200, 385],
    [220, 480],
    [240, 565],
    [270, 670],
    [300, 740],
  ],
  'How 1983'
);

// ─── Grey-headed Flying Fox (Pteropus poliocephalus) ────────────────────────
// Source: Victorian Wildlife Rehabilitation Guidelines, Part B Chapter 4,
// Table 4.7 (DEECA 2023). Birth weight 85 g, forearm 57 mm. Hand-rearing
// weaning at 12 weeks; wild maternal weaning is 5-6 months.
//
// CORRECTED 2026-08: this curve previously cited Divljan 2006 / Hall &
// Richards 2000 and began at 25 g. That is not a plausible birth weight for
// this species — flying foxes are born large — and it disagreed with DEECA's
// own figure by 60 g. On the old curve a genuine 85 g newborn interpolated to
// roughly 24 days old, so estimateBirthDate() placed its birth about three and
// a half weeks too early, shifting feed schedules, age class and release
// timing with it. Forearm lengths in the two sources agreed far more closely,
// which is a further reason to prefer forearm for ageing flying foxes.
//
// DEECA publish ONE table for both sexes. Sexual size dimorphism in this
// species emerges with sexual maturity at 24-36 months, long after the
// hand-rearing period ends, so male and female entries below are deliberately
// identical rather than invented. Adult dimorphism (male 842 g, female 675 g;
// Welbergen 2010) is held separately in src/lib/deeca-flying-fox-care.ts.
const greyHeadedFlyingFoxFemale = weightAndArm(
  'Grey-headed Flying Fox',
  'Female',
  [
    // [ageDays, weightGrams, armLengthMm (forearm)]
    [0, 85, 57],
    [7, 99, 69],
    [14, 117, 79],
    [21, 133, 87],
    [28, 150, 93],
    [35, 167, 99],
    [42, 184, 104],
    [49, 201, 109],
    [56, 217, 114],
    [63, 235, 118],
    [70, 252, 122],
    [77, 269, 125],
    [84, 286, 129],
    [91, 302, 132],
    [98, 319, 136],
    [105, 336, 139],
    [112, 353, 143],
  ],
  'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'
);

const greyHeadedFlyingFoxMale = weightAndArm(
  'Grey-headed Flying Fox',
  'Male',
  [
    [0, 85, 57],
    [7, 99, 69],
    [14, 117, 79],
    [21, 133, 87],
    [28, 150, 93],
    [35, 167, 99],
    [42, 184, 104],
    [49, 201, 109],
    [56, 217, 114],
    [63, 235, 118],
    [70, 252, 122],
    [77, 269, 125],
    [84, 286, 129],
    [91, 302, 132],
    [98, 319, 136],
    [105, 336, 139],
    [112, 353, 143],
  ],
  'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'
);

// ─── Little Red Flying-fox (Pteropus scapulatus) ────────────────────────────
// Source: Victorian Wildlife Rehabilitation Guidelines, Part B Chapter 4,
// Table 4.8 (DEECA 2023). Birth weight 41 g, forearm 45 mm.
//
// CORRECTED 2026-08: previously seeded from Hall & Richards 2000 starting at
// 18 g, against DEECA's 41 g — the same class of error as the grey-headed
// curve and in the same direction.
//
// Little reds are hand raised as for grey-headed flying foxes but take roughly
// half the milk and fruit per feed (DEECA 4.8.2); no separate feeding table is
// published for them. As with the grey-headed curve, DEECA give one unsexed
// table, so male and female entries are identical rather than invented.
const littleRedFlyingFoxFemale = weightAndArm(
  'Little Red Flying-fox',
  'Female',
  [
    // [ageDays, weightGrams, armLengthMm (forearm)]
    [0, 41, 45],
    [7, 49, 50],
    [14, 59, 55],
    [21, 68, 61],
    [28, 79, 66],
    [35, 89, 71],
    [42, 100, 75],
    [49, 111, 80],
    [56, 122, 83],
    [63, 133, 87],
    [70, 145, 90],
    [77, 157, 93],
    [84, 169, 96],
    [91, 182, 98],
    [98, 195, 100],
    [105, 208, 101],
    [112, 221, 103],
  ],
  'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'
);

const littleRedFlyingFoxMale = weightAndArm(
  'Little Red Flying-fox',
  'Male',
  [
    [0, 41, 45],
    [7, 49, 50],
    [14, 59, 55],
    [21, 68, 61],
    [28, 79, 66],
    [35, 89, 71],
    [42, 100, 75],
    [49, 111, 80],
    [56, 122, 83],
    [63, 133, 87],
    [70, 145, 90],
    [77, 157, 93],
    [84, 169, 96],
    [91, 182, 98],
    [98, 195, 100],
    [105, 208, 101],
    [112, 221, 103],
  ],
  'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'
);

export const growthReferenceData: GrowthReferenceRow[] = [
  ...easternGreyKangarooFemale,
  ...easternGreyKangarooMale,
  ...commonWallarooFemale,
  ...commonWallarooMale,
  ...redNeckedWallabyFemale,
  ...redNeckedWallabyMale,
  ...swampWallabyFemale,
  ...swampWallabyMale,
  ...brushtailPossumFemale,
  ...brushtailPossumMale,
  ...ringtailPossumFemale,
  ...ringtailPossumMale,
  ...greyHeadedFlyingFoxFemale,
  ...greyHeadedFlyingFoxMale,
  ...littleRedFlyingFoxFemale,
  ...littleRedFlyingFoxMale,
];
