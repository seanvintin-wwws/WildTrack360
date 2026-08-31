import { describe, expect, it } from 'vitest';
import {
  FLUID_PROFILES,
  checkFluidAgainstConditions,
  getCarerDefaultFluid,
  getFluidProfile,
  identifyFluid,
} from './fluid-therapy-reference';

describe('the carer default', () => {
  it('is 0.9% saline and nothing else', () => {
    const defaults = FLUID_PROFILES.filter((f) => f.carerSafeDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0].id).toBe('normal-saline');
    expect(getCarerDefaultFluid().name).toBe('0.9% sodium chloride');
  });
});

describe('identifying a donated bag', () => {
  it('recognises the abbreviations that appear on stock', () => {
    expect(identifyFluid('LRS')?.id).toBe('lactated-ringers');
    expect(identifyFluid('CSL')?.id).toBe('hartmanns');
    expect(identifyFluid('D5W')?.id).toBe('dextrose-5-water');
    expect(identifyFluid('normal saline')?.id).toBe('normal-saline');
  });

  it('distinguishes Hartmann\u2019s from Lactated Ringer\u2019s', () => {
    // The paper is explicit that these are similar but not identical.
    expect(identifyFluid('Hartmanns')?.id).toBe('hartmanns');
    expect(identifyFluid("Ringer's lactate")?.id).toBe('lactated-ringers');
    expect(getFluidProfile('hartmanns')).not.toEqual(getFluidProfile('lactated-ringers'));
  });

  it('does not resolve a longer name via a short abbreviation inside it', () => {
    // Regression: "NS" is a substring of "hartmaNNS". Naive containment
    // matching returned normal saline for Hartmann's — telling a carer they
    // held the always-safe fluid when they did not.
    expect(identifyFluid('Hartmanns')?.id).toBe('hartmanns');
    expect(identifyFluid('Hartmanns')?.id).not.toBe('normal-saline');
  });

  it('returns nothing for an unrecognised label rather than guessing', () => {
    expect(identifyFluid('some unlabelled bag')).toBeUndefined();
    expect(identifyFluid('')).toBeUndefined();
  });
});

describe('contraindications, which are the point of this module', () => {
  it("blocks Lactated Ringer's in renal failure", () => {
    const w = checkFluidAgainstConditions(getFluidProfile('lactated-ringers')!, [
      'renal failure',
    ]);
    expect(w.some((x) => x.severity === 'do-not-use')).toBe(true);
  });

  it("blocks Lactated Ringer's with liver issues", () => {
    const w = checkFluidAgainstConditions(getFluidProfile('lactated-ringers')!, [
      'liver issues',
    ]);
    expect(w.some((x) => x.severity === 'do-not-use')).toBe(true);
  });

  it('blocks half normal saline in burns and trauma', () => {
    const fluid = getFluidProfile('half-normal-saline')!;
    expect(
      checkFluidAgainstConditions(fluid, ['burns']).some((x) => x.severity === 'do-not-use')
    ).toBe(true);
    expect(
      checkFluidAgainstConditions(fluid, ['trauma']).some((x) => x.severity === 'do-not-use')
    ).toBe(true);
  });

  it('blocks D5W in resuscitation', () => {
    const w = checkFluidAgainstConditions(getFluidProfile('dextrose-5-water')!, [
      'resuscitation',
    ]);
    expect(w.some((x) => x.severity === 'do-not-use')).toBe(true);
  });

  it('blocks normal saline in congestive heart failure', () => {
    const w = checkFluidAgainstConditions(getFluidProfile('normal-saline')!, [
      'congestive heart failure',
    ]);
    expect(w.some((x) => x.severity === 'do-not-use')).toBe(true);
  });

  it('returns nothing when no condition matches', () => {
    expect(
      checkFluidAgainstConditions(getFluidProfile('normal-saline')!, ['orphaned'])
    ).toEqual([]);
  });
});

describe('scope', () => {
  it('carries no doses, volumes or rates anywhere in the module', () => {
    // The source paper contains none, so neither should this. A regression
    // here would mean someone had added a figure the source does not support.
    const serialised = JSON.stringify(FLUID_PROFILES);
    expect(serialised).not.toMatch(/ml\/kg/i);
    expect(serialised).not.toMatch(/\bml per\b/i);
    expect(serialised).not.toMatch(/mg\/kg/i);
  });

  it('records tonicity for every fluid', () => {
    for (const f of FLUID_PROFILES) {
      expect(['isotonic', 'hypotonic', 'hypertonic']).toContain(f.tonicity);
    }
  });
});
