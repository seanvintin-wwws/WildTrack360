import { describe, expect, it } from 'vitest';
import { suggestAgeClass, getMilestones } from './vic-age-class';

describe('species lookup across naming variants', () => {
  // These spellings all occur in the codebase: the growth reference seed data
  // says "Grey-headed Flying Fox" and "Common brushtail possum", while the
  // DEECA code book and this module say "Grey-headed Flying-fox" and
  // "Common Brushtail Possum". A lookup miss fails silently — the carer simply
  // never sees a suggestion, with nothing to indicate why — so each variant is
  // pinned here.
  it('matches the growth reference spelling of the flying-fox', () => {
    expect(getMilestones('Grey-headed Flying Fox')).toBeDefined();
  });

  it('matches the DEECA code book spelling of the flying-fox', () => {
    expect(getMilestones('Grey-headed Flying-fox')).toBeDefined();
  });

  it('matches both brushtail spellings', () => {
    expect(getMilestones('Common brushtail possum')).toBeDefined();
    expect(getMilestones('Common Brushtail Possum')).toBeDefined();
  });

  it('still returns nothing for species with no published milestones', () => {
    expect(getMilestones('Eastern Grey Kangaroo')).toBeUndefined();
    expect(getMilestones('Tawny Frogmouth')).toBeUndefined();
  });

  it('suggests for the growth-data spelling, not just the module spelling', () => {
    expect(suggestAgeClass('Grey-headed Flying Fox', 40)).not.toBeNull();
    expect(suggestAgeClass('Common brushtail possum', 100)?.code).toBe('P');
  });
});


describe('age class suggestion', () => {
  it('suggests pouch young before pouch exit', () => {
    const s = suggestAgeClass('Common Ringtail Possum', 90)!;
    expect(s.code).toBe('P');
    expect(s.ambiguous).toBe(false);
    expect(s.source).toBe('How 1983');
  });

  it('suggests dependent young between pouch exit and weaning', () => {
    const s = suggestAgeClass('Common Ringtail Possum', 150)!;
    expect(s.code).toBe('D');
    expect(s.ambiguous).toBe(false);
  });

  it('uses the right milestones per species', () => {
    // 150 days is dependent-young for a ringtail but still pouch young
    // for a brushtail, which stays in the pouch longer.
    expect(suggestAgeClass('Common Ringtail Possum', 150)!.code).toBe('D');
    expect(suggestAgeClass('Common Brushtail Possum', 149)!.code).toBe('P');
  });

  it('refuses to separate subadult from adult on age alone', () => {
    const s = suggestAgeClass('Common Brushtail Possum', 400)!;
    expect(s.code).toBeNull();
    expect(s.ambiguous).toBe(true);
    expect(s.label).toBe('Subadult or adult');
  });

  it('never suggests Adult, since no fully-grown age is published', () => {
    for (const age of [200, 300, 500, 1000, 3000]) {
      const s = suggestAgeClass('Common Ringtail Possum', age);
      expect(s?.code).not.toBe('A');
    }
  });

  it('cannot separate P from D for flying-foxes and says so', () => {
    const s = suggestAgeClass('Grey-headed Flying-fox', 40)!;
    expect(s.code).toBeNull();
    expect(s.ambiguous).toBe(true);
    expect(s.caveat).toContain('placental');
  });

  it('returns nothing for species with no published milestones', () => {
    expect(suggestAgeClass('Eastern Grey Kangaroo', 100)).toBeNull();
    expect(suggestAgeClass('Tiger Snake', 100)).toBeNull();
    expect(suggestAgeClass('Australian Magpie', 30)).toBeNull();
  });

  it('rejects impossible ages', () => {
    expect(suggestAgeClass('Common Ringtail Possum', -5)).toBeNull();
    expect(suggestAgeClass('Common Ringtail Possum', NaN)).toBeNull();
  });

  it('cites a source on every suggestion it makes', () => {
    const species = [
      'Common Brushtail Possum',
      'Common Ringtail Possum',
      'Grey-headed Flying-fox',
    ];
    for (const sp of species) {
      expect(getMilestones(sp)!.source.length).toBeGreaterThan(0);
      expect(suggestAgeClass(sp, 100)!.source.length).toBeGreaterThan(0);
    }
  });
});
