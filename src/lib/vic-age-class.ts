/**
 * Suggest a DEECA age class from an estimated age.
 *
 * WHY THIS SUGGESTS RATHER THAN AUTO-FILLS
 * The age class goes onto the Wildlife Shelter Record Sheet, which is a legal
 * record under Condition 23 of the Wildlife Rehabilitator Authorisation and
 * must be produced to an Authorised Officer on request. A wrong value there is
 * a compliance problem, not just a data-quality one. So this module returns a
 * suggestion with its reasoning and its source, for a carer to confirm — it
 * never writes the field itself.
 *
 * WHY COVERAGE IS NARROW
 * DEECA's classes are developmental, not size-based: "pouch young, not yet
 * weaned", "dependent young, on back or at heel", "weaned, not fully grown".
 * Turning a weight or forearm measurement into one of those requires knowing
 * the age at which that species crosses each milestone. That is published for
 * some species and not others. Where it isn't, this module returns nothing
 * rather than a plausible guess.
 *
 * Note in particular that no species here has a published "fully grown" age,
 * so this module never suggests Adult. An animal past weaning is reported as
 * subadult-or-adult and left to the carer, who can see the animal.
 */

import type { VicAnimalGroup } from './vic-picklists';

export interface DevelopmentalMilestones {
  species: string;
  group: VicAnimalGroup;
  /** Age in days at which young leave the pouch, where published. */
  pouchExitDays?: number;
  /** Age in days at weaning, where published. */
  weaningDays?: number;
  source: string;
  /**
   * Set when DEECA's class definitions don't map cleanly onto this species'
   * biology — surfaced to the carer instead of a suggestion.
   */
  caveat?: string;
}

export const DEVELOPMENTAL_MILESTONES: DevelopmentalMilestones[] = [
  {
    species: 'Common Brushtail Possum',
    group: 'mammal',
    pouchExitDays: 150,
    weaningDays: 210,
    source: 'Kerle 1984',
  },
  {
    species: 'Common Ringtail Possum',
    group: 'mammal',
    pouchExitDays: 120,
    weaningDays: 180,
    source: 'How 1983',
  },
  {
    species: 'Grey-headed Flying-fox',
    group: 'mammal',
    // Biolac put the milk-dependent period at roughly 11-12 weeks.
    weaningDays: 84,
    source: 'Biolac flying-fox formula guidance (weaning ~11-12 weeks)',
    caveat:
      "Flying-foxes are placental, so DEECA's pouch-young and at-heel classes " +
      'do not map cleanly. Classify on whether the pup is still milk-dependent ' +
      'and whether it is carried, creched or flying, and confirm with your ' +
      'species coordinator.',
  },
];

export interface AgeClassSuggestion {
  /** DEECA age code, or null where no single code can be justified. */
  code: string | null;
  label: string;
  /** Plain-English reasoning shown to the carer. */
  reasoning: string;
  source: string;
  caveat?: string;
  /** True when the carer must decide between two codes. */
  ambiguous: boolean;
}

/**
 * Species names are spelled inconsistently across the codebase and by carers:
 * the growth reference data says "Grey-headed Flying Fox", the DEECA code book
 * says "Grey-headed Flying-fox", and "Common brushtail possum" appears in mixed
 * case. Matching on the raw string means the lookup fails silently and the
 * carer simply never sees a suggestion, with nothing to indicate why. So
 * normalise hyphens, spacing and case before comparing.
 */
function normaliseSpecies(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getMilestones(species: string): DevelopmentalMilestones | undefined {
  const s = normaliseSpecies(species);
  return DEVELOPMENTAL_MILESTONES.find((m) => normaliseSpecies(m.species) === s);
}

/**
 * Suggest a DEECA age class for a mammal of known estimated age.
 * Returns null when there is no published basis for this species.
 */
export function suggestAgeClass(
  species: string,
  estimatedAgeDays: number
): AgeClassSuggestion | null {
  const m = getMilestones(species);
  if (!m) return null;
  if (!Number.isFinite(estimatedAgeDays) || estimatedAgeDays < 0) return null;

  const days = Math.round(estimatedAgeDays);

  if (m.pouchExitDays != null && days < m.pouchExitDays) {
    return {
      code: 'P',
      label: 'Pouch young',
      reasoning: `Estimated ${days} days old, before pouch exit at about ${m.pouchExitDays} days.`,
      source: m.source,
      caveat: m.caveat,
      ambiguous: false,
    };
  }

  if (m.weaningDays != null && days < m.weaningDays) {
    if (m.pouchExitDays != null) {
      return {
        code: 'D',
        label: 'Dependent young',
        reasoning: `Estimated ${days} days old — past pouch exit (~${m.pouchExitDays} days) but not yet weaned (~${m.weaningDays} days).`,
        source: m.source,
        caveat: m.caveat,
        ambiguous: false,
      };
    }
    // Weaning known but pouch exit isn't: can't separate P from D.
    return {
      code: null,
      label: 'Pouch young or dependent young',
      reasoning: `Estimated ${days} days old and still milk-dependent (weaning ~${m.weaningDays} days), but there is no published pouch-exit age for this species to separate P from D.`,
      source: m.source,
      caveat: m.caveat,
      ambiguous: true,
    };
  }

  // Past weaning. "Fully grown" age is not published for any species here,
  // so S and A cannot be separated from age alone.
  return {
    code: null,
    label: 'Subadult or adult',
    reasoning: `Estimated ${days} days old, past weaning (~${m.weaningDays} days). Separating subadult from adult needs a judgement about whether the animal is fully grown, which cannot be read off age alone.`,
    source: m.source,
    caveat: m.caveat,
    ambiguous: true,
  };
}
