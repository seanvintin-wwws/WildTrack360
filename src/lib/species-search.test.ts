import { describe, expect, it } from 'vitest';
import {
  excludedByAuthorisation,
  MATCH_RANK,
  normaliseForSearch,
  rankSpeciesMatches,
  scoreSpeciesMatch,
} from './species-search';

/**
 * The names below are the awkward real ones from the seeded data, not tidy
 * examples: inconsistent hyphenation and inconsistent capitalisation are the
 * whole reason this module exists.
 */
const SPECIES = [
  { name: 'Common brushtail possum' },
  { name: 'Mountain Brushtail Possum' },
  { name: 'Common Ringtail Possum' },
  { name: 'Grey-headed Flying Fox' },
  { name: 'Little Red Flying-fox' },
  { name: 'Eastern Grey Kangaroo' },
  { name: 'Sugar Glider', scientificName: 'Petaurus breviceps' },
];

describe('normaliseForSearch', () => {
  it('flattens case, hyphens and repeated whitespace', () => {
    expect(normaliseForSearch('Grey-headed  Flying-fox')).toBe(
      'grey headed flying fox'
    );
    expect(normaliseForSearch('GREY HEADED FLYING FOX')).toBe(
      'grey headed flying fox'
    );
  });

  it('makes the two flying fox spellings comparable', () => {
    expect(normaliseForSearch('Little Red Flying-fox')).toBe(
      normaliseForSearch('little red flying fox')
    );
  });

  it('trims surrounding whitespace', () => {
    expect(normaliseForSearch('  Koala  ')).toBe('koala');
  });
});

describe('scoreSpeciesMatch', () => {
  it('ranks an exact name above a prefix above a mid-name word', () => {
    const exact = scoreSpeciesMatch({ name: 'Koala' }, 'koala');
    const prefix = scoreSpeciesMatch({ name: 'Koala Joey' }, 'koala j');
    const word = scoreSpeciesMatch(
      { name: 'Common Brushtail Possum' },
      'possum'
    );
    expect(exact).toBe(MATCH_RANK.EXACT);
    expect(prefix).toBe(MATCH_RANK.STARTS_WITH);
    expect(word).toBe(MATCH_RANK.WORD_STARTS_WITH);
    expect(exact).toBeLessThan(prefix!);
    expect(prefix).toBeLessThan(word!);
  });

  it('matches across a hyphen the user did not type', () => {
    expect(
      scoreSpeciesMatch({ name: 'Grey-headed Flying Fox' }, 'grey headed')
    ).toBe(MATCH_RANK.STARTS_WITH);
  });

  it('matches a hyphen the user did type against unhyphenated data', () => {
    expect(
      scoreSpeciesMatch({ name: 'Grey headed Flying Fox' }, 'grey-headed')
    ).toBe(MATCH_RANK.STARTS_WITH);
  });

  it('falls back to scientific name, ranked last', () => {
    expect(
      scoreSpeciesMatch(
        { name: 'Sugar Glider', scientificName: 'Petaurus breviceps' },
        'petaurus'
      )
    ).toBe(MATCH_RANK.SCIENTIFIC);
  });

  it('returns null when nothing matches', () => {
    expect(scoreSpeciesMatch({ name: 'Koala' }, 'penguin')).toBeNull();
  });

  it('treats an empty query as matching everything', () => {
    expect(scoreSpeciesMatch({ name: 'Koala' }, '')).toBe(MATCH_RANK.EXACT);
    expect(scoreSpeciesMatch({ name: 'Koala' }, '   ')).toBe(MATCH_RANK.EXACT);
  });
});

describe('rankSpeciesMatches', () => {
  it('puts possums first when searching "possum"', () => {
    const names = rankSpeciesMatches(SPECIES, 'possum').map((s) => s.name);
    // All three match at WORD_STARTS_WITH, so the tiebreak is alphabetical
    // and is case-insensitive — the lowercase "brushtail" record sorts first.
    expect(names).toEqual([
      'Common brushtail possum',
      'Common Ringtail Possum',
      'Mountain Brushtail Possum',
    ]);
  });

  it('finds the lowercase brushtail record by its common name', () => {
    const names = rankSpeciesMatches(SPECIES, 'brushtail').map((s) => s.name);
    expect(names).toContain('Common brushtail possum');
    expect(names).toContain('Mountain Brushtail Possum');
  });

  it('finds both flying foxes despite inconsistent hyphenation', () => {
    const names = rankSpeciesMatches(SPECIES, 'flying fox').map((s) => s.name);
    expect(names).toContain('Grey-headed Flying Fox');
    expect(names).toContain('Little Red Flying-fox');
  });

  it('ranks a whole-name prefix above a later-word match', () => {
    const names = rankSpeciesMatches(SPECIES, 'common').map((s) => s.name);
    expect(names[0]).toBe('Common brushtail possum');
    expect(names[1]).toBe('Common Ringtail Possum');
  });

  it('returns everything alphabetically for an empty query', () => {
    const names = rankSpeciesMatches(SPECIES, '').map((s) => s.name);
    expect(names).toHaveLength(SPECIES.length);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('returns an empty list rather than everything when nothing matches', () => {
    expect(rankSpeciesMatches(SPECIES, 'zzzzz')).toEqual([]);
  });

  it('only ever returns supplied items, never the query', () => {
    // The stored value feeds lookupVicSpeciesCode(); a free-text value would
    // silently produce a blank SPECIES CODE cell on the record sheet.
    const results = rankSpeciesMatches(SPECIES, 'Common Brushtail Possum');
    for (const result of results) {
      expect(SPECIES).toContain(result);
    }
  });
});

describe('excludedByAuthorisation (Condition 1)', () => {
  it('excludes the species named in Condition 1', () => {
    for (const name of [
      'Humpback Whale',
      'Common Dolphin',
      'Australian Fur Seal',
      'Green Turtle',
      'Loggerhead Turtle',
      'Platypus',
      'Sambar Deer',
      'Common Pheasant',
      'Grey Partridge',
      'Californian Quail',
    ]) {
      expect(excludedByAuthorisation(name), name).not.toBeNull();
    }
  });

  it('does NOT exclude native quail — only non-indigenous ones are excluded', () => {
    // Brown, Stubble and King Quail are native and permitted. Matching the
    // bare word "quail" would have silently blocked legitimate admissions.
    expect(excludedByAuthorisation('Brown Quail')).toBeNull();
    expect(excludedByAuthorisation('Stubble Quail')).toBeNull();
    expect(excludedByAuthorisation('King Quail')).toBeNull();
  });

  it('does NOT exclude freshwater turtles', () => {
    expect(excludedByAuthorisation('Eastern Long-necked Turtle')).toBeNull();
    expect(excludedByAuthorisation('Murray River Turtle')).toBeNull();
  });

  it('does not let "fish" catch unrelated names', () => {
    expect(excludedByAuthorisation('Azure Kingfisher')).toBeNull();
    expect(excludedByAuthorisation('Sacred Kingfisher')).toBeNull();
    expect(excludedByAuthorisation('Large-footed Fishing Bat')).toBeNull();
  });

  it('leaves ordinary permitted species alone', () => {
    for (const name of [
      'Common brushtail possum',
      'Grey-headed Flying Fox',
      'Eastern Grey Kangaroo',
      'Koala',
      'Short-beaked Echidna',
    ]) {
      expect(excludedByAuthorisation(name), name).toBeNull();
    }
  });
});

describe('rankSpeciesMatches options', () => {
  const WITH_TYPES = [
    { name: 'Common brushtail possum', type: 'Mammal' },
    { name: 'Common Ringtail Possum', type: 'Mammal' },
    { name: 'Australian Magpie', type: 'Bird' },
    { name: 'Platypus', type: 'Mammal' },
  ];

  it('filters to a single type', () => {
    const names = rankSpeciesMatches(WITH_TYPES, '', { type: 'Bird' }).map(
      (s) => s.name
    );
    expect(names).toEqual(['Australian Magpie']);
  });

  it('matches type case-insensitively', () => {
    expect(rankSpeciesMatches(WITH_TYPES, '', { type: 'bird' })).toHaveLength(1);
  });

  it('drops unauthorised species when asked', () => {
    const names = rankSpeciesMatches(WITH_TYPES, '', {
      excludeUnauthorised: true,
    }).map((s) => s.name);
    expect(names).not.toContain('Platypus');
    expect(names).toContain('Common brushtail possum');
  });

  it('keeps unauthorised species by default', () => {
    expect(rankSpeciesMatches(WITH_TYPES, '').map((s) => s.name)).toContain(
      'Platypus'
    );
  });

  it('puts recently used species first on an empty query', () => {
    const names = rankSpeciesMatches(SPECIES, '', {
      recentNames: ['Grey-headed Flying Fox', 'Common brushtail possum'],
    }).map((s) => s.name);
    expect(names[0]).toBe('Grey-headed Flying Fox');
    expect(names[1]).toBe('Common brushtail possum');
  });

  it('matches recents across hyphen and case differences', () => {
    const names = rankSpeciesMatches(SPECIES, '', {
      recentNames: ['grey headed flying fox'],
    }).map((s) => s.name);
    expect(names[0]).toBe('Grey-headed Flying Fox');
  });

  it('never lets recency beat a better textual match', () => {
    // "Eastern" is a prefix match on the kangaroo; the possum is only recent.
    const names = rankSpeciesMatches(SPECIES, 'eastern', {
      recentNames: ['Common brushtail possum'],
    }).map((s) => s.name);
    expect(names[0]).toBe('Eastern Grey Kangaroo');
  });

  it('uses recency only to break ties within the same match quality', () => {
    const names = rankSpeciesMatches(SPECIES, 'possum', {
      recentNames: ['Mountain Brushtail Possum'],
    }).map((s) => s.name);
    // All three are word-prefix matches, so the recent one leads instead of
    // the alphabetical winner.
    expect(names[0]).toBe('Mountain Brushtail Possum');
  });
});
