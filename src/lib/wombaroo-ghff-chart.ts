/**
 * "Wombaroo Feed Chart for Black & Grey-headed Flying-foxes", growth columns.
 *
 * Source: Bat Rescue Inc, Orphan Training Manual (2021), Appendix 2, p.60
 * (batrescue.org.au/wp-content/uploads/2021/11/Orphan-Training-Manual.pdf).
 * Extracted from the PDF's text layer by position, day 0 to day 91, and
 * checked against the printed page. Weekly rows (Wk1..Wk13) are days 7..91.
 *
 * Provenance note: the manual titles this a Wombaroo chart; no copy published
 * by Wombaroo itself was found. It is a different reference from the DEECA
 * curve (Table 4.7): about 15 g lighter at birth (70 g vs 85 g), converging
 * around 9 weeks and slightly heavier by weaning.
 */

import type { GrowthReferencePoint } from './growth-utils';

export const WOMBAROO_CHART_SOURCE =
  'Wombaroo Feed Chart (Black & Grey-headed Flying-foxes), Bat Rescue Orphan Training Manual 2021, p.60';

/** Species this chart applies to (matched case-insensitively). */
export const WOMBAROO_CHART_SPECIES = ['grey-headed flying fox', 'grey-headed flying-fox'];

/** [ageDays, forearmMm, weightGrams] */
export const WOMBAROO_GHFF_CHART: [number, number, number][] = [
  [0, 60, 70],
  [1, 62, 72],
  [2, 63, 75],
  [3, 64, 77],
  [4, 65, 79],
  [5, 66, 82],
  [6, 67, 84],
  [7, 69, 86],
  [8, 70, 89],
  [9, 71, 91],
  [10, 72, 93],
  [11, 73, 96],
  [12, 74, 98],
  [13, 75, 101],
  [14, 76, 103],
  [15, 77, 106],
  [16, 79, 108],
  [17, 80, 111],
  [18, 81, 113],
  [19, 82, 115],
  [20, 83, 118],
  [21, 84, 120],
  [22, 85, 123],
  [23, 86, 125],
  [24, 87, 128],
  [25, 88, 131],
  [26, 89, 133],
  [27, 90, 136],
  [28, 91, 138],
  [29, 92, 141],
  [30, 93, 143],
  [31, 93, 146],
  [32, 94, 149],
  [33, 95, 151],
  [34, 96, 154],
  [35, 97, 156],
  [36, 98, 159],
  [37, 99, 162],
  [38, 100, 164],
  [39, 101, 167],
  [40, 101, 170],
  [41, 102, 172],
  [42, 103, 175],
  [43, 104, 178],
  [44, 105, 181],
  [45, 106, 183],
  [46, 106, 186],
  [47, 107, 189],
  [48, 108, 192],
  [49, 109, 194],
  [50, 110, 197],
  [51, 110, 200],
  [52, 111, 203],
  [53, 112, 205],
  [54, 113, 208],
  [55, 113, 211],
  [56, 114, 214],
  [57, 115, 217],
  [58, 115, 220],
  [59, 116, 222],
  [60, 117, 225],
  [61, 118, 228],
  [62, 118, 231],
  [63, 119, 234],
  [64, 120, 237],
  [65, 120, 240],
  [66, 121, 243],
  [67, 121, 246],
  [68, 122, 249],
  [69, 123, 252],
  [70, 123, 255],
  [71, 124, 258],
  [72, 124, 261],
  [73, 125, 264],
  [74, 126, 267],
  [75, 126, 270],
  [76, 127, 273],
  [77, 127, 276],
  [78, 128, 279],
  [79, 128, 282],
  [80, 129, 285],
  [81, 129, 288],
  [82, 130, 291],
  [83, 130, 294],
  [84, 131, 297],
  [85, 131, 300],
  [86, 132, 303],
  [87, 132, 307],
  [88, 133, 310],
  [89, 133, 313],
  [90, 133, 316],
  [91, 134, 319],
];

export function wombarooReference(): GrowthReferencePoint[] {
  return WOMBAROO_GHFF_CHART.map(([ageDays, armLengthMm, weightGrams]) => ({
    ageDays,
    weightGrams,
    armLengthMm,
    headLengthMm: null,
    earLengthMm: null,
    legLengthMm: null,
    footLengthMm: null,
    tailLengthMm: null,
    bodyLengthMm: null,
    wingLengthMm: null,
  }));
}

export function wombarooChartAppliesTo(species: string | null): boolean {
  return !!species && WOMBAROO_CHART_SPECIES.includes(species.toLowerCase());
}
