/**
 * Wombaroo Flying Fox Milk Replacer feed chart for the Grey-headed Flying Fox
 * (Pteropus poliocephalus), growth and feed columns.
 *
 * Source: Wombaroo, "Milk for Flying Foxes (Fruit Bats)", Grey-Headed Flying
 * Fox table, as published by Wombaroo. Every printed row is transcribed here
 * exactly (day 2 to day 84) and pinned by wombaroo-ghff-chart.test.ts. No rows
 * are interpolated or extrapolated: the chart draws straight lines between the
 * printed ages, and nothing is shown before day 2 or after day 84.
 *
 * Wombaroo notes the chart may also be used for similar-sized species such as
 * the Black Flying Fox (P. alecto).
 *
 * The feed column is mL per day of Wombaroo Flying Fox Milk Replacer only. It
 * must not be applied to goat's milk, cow's milk or Biolac. Wombaroo's notes:
 * 5 feeds per day from day 2, 4 feeds per day from day 28, introduce pureed
 * apple at day 44, diced fruit with High Protein Supplement at day 56, start
 * weaning at day 66 (milk volume then depends on fruit eaten).
 *
 * Replaces an earlier version taken from Bat Rescue Inc's Orphan Training
 * Manual (2021) p.60. That version had the same weights but forearms 1-4 mm
 * longer in the first month, plus daily rows from day 0 to day 91 not found
 * in Wombaroo's own table.
 */

import type { GrowthReferencePoint } from './growth-utils';

export const WOMBAROO_CHART_SOURCE =
  "Wombaroo Flying Fox Milk Replacer feed chart, Grey-headed Flying Fox (Wombaroo, 'Milk for Flying Foxes')";

/** Species this chart applies to (matched case-insensitively). */
export const WOMBAROO_CHART_SPECIES = ['grey-headed flying fox', 'grey-headed flying-fox'];

/** [ageDays, forearmMm, legMm, weightGrams, feedMlPerDay] as printed by Wombaroo. */
export const WOMBAROO_GHFF_CHART: [number, number, number, number, number][] = [
  [2, 59, 31, 75, 27],
  [4, 62, 33, 79, 28],
  [8, 67, 36, 88, 30],
  [12, 72, 39, 98, 32],
  [16, 77, 41, 108, 35],
  [20, 82, 43, 118, 38],
  [24, 86, 45, 128, 40],
  [28, 90, 47, 138, 42],
  [32, 94, 48, 148, 44],
  [36, 98, 49, 159, 46],
  [40, 102, 50, 170, 48],
  [44, 105, 51, 181, 50],
  [48, 108, 52, 192, 52],
  [52, 111, 53, 203, 54],
  [56, 114, 54, 214, 57],
  [60, 117, 55, 225, 59],
  [66, 121, 56, 243, 45],
  [72, 125, 57, 261, 30],
  [78, 128, 58, 279, 15],
  [84, 131, 59, 297, 0],
];

export function wombarooReference(): GrowthReferencePoint[] {
  return WOMBAROO_GHFF_CHART.map(([ageDays, armLengthMm, legLengthMm, weightGrams]) => ({
    ageDays,
    weightGrams,
    armLengthMm,
    headLengthMm: null,
    earLengthMm: null,
    legLengthMm,
    footLengthMm: null,
    tailLengthMm: null,
    bodyLengthMm: null,
    wingLengthMm: null,
  }));
}

export function wombarooChartAppliesTo(species: string | null): boolean {
  return !!species && WOMBAROO_CHART_SPECIES.includes(species.toLowerCase());
}
