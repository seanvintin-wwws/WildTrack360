/**
 * Matching and ranking for the species picker.
 *
 * WHY THIS IS A SEPARATE MODULE
 * The picker itself is a React component, and this project's vitest setup only
 * collects `src/**\/*.test.ts` in a node environment — there is no jsdom and no
 * component testing. Keeping the decision-making here means the part that can
 * actually be wrong is the part that gets tested.
 *
 * WHY MATCHING IS FORGIVING BUT SELECTION IS NOT
 * Species names in the data are inconsistent: "Grey-headed Flying Fox" is
 * hyphenated, "Common brushtail possum" is lowercase, spacing varies. A plain
 * `includes()` filter fails silently on all of those — the carer types
 * something reasonable, sees "No species found", and either picks the wrong
 * thing or gives up.
 *
 * But the string that gets stored is what `lookupVicSpeciesCode()` resolves
 * against to fill the SPECIES CODE column on the Wildlife Shelter Record
 * Sheet. An unrecognised name yields no code and the export leaves that cell
 * blank. So: generous about what may be typed, strict about what may be
 * chosen. This module only ever returns items from the supplied list. It never
 * turns a query into a value.
 */

export interface SpeciesSearchItem {
  name: string;
  scientificName?: string | null;
  /** 'Mammal' | 'Bird' | 'Reptile' | 'Amphibian' — from Species.type. */
  type?: string | null;
}

/**
 * Wildlife excluded by Condition 1 of the DEECA Shelter Authorisation:
 * whales, dolphins, seals, marine turtles, platypus, fish, deer,
 * non-indigenous quail, pheasants and partridges.
 *
 * MATCHING IS DELIBERATELY CONSERVATIVE. Wrongly hiding a species the shelter
 * IS authorised for is the worse error — it blocks a legitimate record — so
 * every pattern here is word-bounded and the ambiguous cases are enumerated
 * rather than matched loosely:
 *
 *  - "quail" is NOT excluded as a word. Brown, Stubble and King Quail are
 *    native and permitted; only non-indigenous quail are excluded, so those
 *    are listed by name.
 *  - "fish" is word-bounded so it cannot catch Kingfisher or Fishing Bat.
 *  - "turtle" is NOT excluded as a word. Freshwater turtles are permitted;
 *    only marine turtles are excluded, so those are listed by name.
 */
const EXCLUDED_PATTERNS: { reason: string; pattern: RegExp }[] = [
  { reason: 'whales and dolphins', pattern: /\b(whale|whales|dolphin|dolphins|orca)\b/ },
  { reason: 'seals', pattern: /\b(seal|seals|sealion|sea lion|fur seal)\b/ },
  { reason: 'marine turtles', pattern: /\b(green turtle|loggerhead|hawksbill|leatherback|olive ridley|flatback turtle|marine turtle)\b/ },
  { reason: 'platypus', pattern: /\bplatypus\b/ },
  { reason: 'fish', pattern: /\bfish\b/ },
  { reason: 'deer', pattern: /\b(deer|sambar|hog deer|fallow deer|red deer)\b/ },
  { reason: 'pheasants and partridges', pattern: /\b(pheasant|pheasants|partridge|partridges|peafowl)\b/ },
  { reason: 'non-indigenous quail', pattern: /\b(californian quail|california quail|japanese quail)\b/ },
];

/**
 * Returns the reason a species is outside the authorisation, or null if it is
 * permitted. Used to keep unauthorised species out of the picker — the shelter
 * must not acquire them, so there is no admission to record.
 */
export function excludedByAuthorisation(name: string): string | null {
  const normalised = normaliseForSearch(name);
  for (const { reason, pattern } of EXCLUDED_PATTERNS) {
    if (pattern.test(normalised)) return reason;
  }
  return null;
}

/**
 * Flattens the differences that show up in real species data: case, hyphens,
 * punctuation and repeated whitespace. "Grey-headed Flying-fox", "grey headed
 * flying fox" and "GREY  HEADED FLYING FOX" all reduce to the same string.
 */
export function normaliseForSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[-_/(),.']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Lower is better. */
export const MATCH_RANK = {
  EXACT: 0,
  STARTS_WITH: 1,
  WORD_STARTS_WITH: 2,
  CONTAINS: 3,
  SCIENTIFIC: 4,
} as const;

/**
 * Scores one species against a query. Returns null when it does not match.
 */
export function scoreSpeciesMatch(
  item: SpeciesSearchItem,
  query: string
): number | null {
  const q = normaliseForSearch(query);
  // An empty query matches everything equally; ordering then falls through to
  // the alphabetical tiebreak in rankSpeciesMatches.
  if (q === '') return MATCH_RANK.EXACT;

  const name = normaliseForSearch(item.name);

  if (name === q) return MATCH_RANK.EXACT;
  if (name.startsWith(q)) return MATCH_RANK.STARTS_WITH;

  // Typing "possum" should surface "Common Brushtail Possum" above something
  // that merely contains those letters in the middle of a word.
  if (name.split(' ').some((word) => word.startsWith(q))) {
    return MATCH_RANK.WORD_STARTS_WITH;
  }

  if (name.includes(q)) return MATCH_RANK.CONTAINS;

  const scientific = item.scientificName
    ? normaliseForSearch(item.scientificName)
    : '';
  if (scientific !== '' && scientific.includes(q)) return MATCH_RANK.SCIENTIFIC;

  return null;
}

/**
 * Returns matching items, best match first, alphabetical within each rank.
 * An empty query returns everything alphabetically.
 */
export interface RankOptions {
  /**
   * Species this shelter has admitted before, most recent first. These sort
   * ahead of others OF THE SAME MATCH QUALITY — recency is a tiebreak, never
   * an override. A better textual match always wins, so typing the name of a
   * species you have never taken in still puts it first.
   */
  recentNames?: string[];
  /** Restrict to one Species.type, e.g. 'Mammal'. Null/undefined = all. */
  type?: string | null;
  /**
   * Drop species excluded by Condition 1 of the authorisation. Defaults to
   * false so the pure ranking stays independent of jurisdiction.
   */
  excludeUnauthorised?: boolean;
}

export function rankSpeciesMatches<T extends SpeciesSearchItem>(
  items: T[],
  query: string,
  options: RankOptions = {}
): T[] {
  const { recentNames = [], type, excludeUnauthorised = false } = options;

  const recencyOf = new Map(
    recentNames.map((name, index) => [normaliseForSearch(name), index])
  );

  return items
    .filter((item) => {
      if (type && normaliseForSearch(item.type ?? '') !== normaliseForSearch(type)) {
        return false;
      }
      if (excludeUnauthorised && excludedByAuthorisation(item.name)) return false;
      return true;
    })
    .map((item) => ({
      item,
      rank: scoreSpeciesMatch(item, query),
      recency: recencyOf.get(normaliseForSearch(item.name)) ?? Number.MAX_SAFE_INTEGER,
    }))
    .filter(
      (scored): scored is { item: T; rank: number; recency: number } =>
        scored.rank !== null
    )
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.recency - b.recency ||
        a.item.name.localeCompare(b.item.name)
    )
    .map((scored) => scored.item);
}
