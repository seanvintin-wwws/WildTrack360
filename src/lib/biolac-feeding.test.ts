import { describe, expect, it } from 'vitest';
import {
  BIOLAC_FORMULAS,
  calculateFeedPlan,
  getBiolacFormula,
  suggestedFormulaIds,
} from './biolac-feeding';

const flyingFox = getBiolacFormula('flying-fox')!;
const starter = getBiolacFormula('starter-100')!;

describe('Biolac feed plan', () => {
  it("matches the manufacturer's own worked example for a 100g flying-fox pup", () => {
    // Biolac state plainly that a 100g pup takes around 25mL per DAY.
    // This is the single most important number in the module: the same figure
    // mistaken for a per-feed volume would mean feeding 4-5x too much.
    const plan = calculateFeedPlan(flyingFox, 100)!;
    expect(plan.dailyVolumeMaxMl).toBe(25);
    expect(plan.dailyVolumeMinMl).toBe(20);
    expect(plan.perFeedMaxMl).toBe(5);
  });

  it('splits the daily total across feeds rather than repeating it', () => {
    const plan = calculateFeedPlan(flyingFox, 200, 5)!;
    expect(plan.dailyVolumeMaxMl).toBe(50);
    expect(plan.perFeedMaxMl).toBe(10);
    expect(plan.perFeedMaxMl * plan.feedsPerDay).toBeCloseTo(
      plan.dailyVolumeMaxMl,
      5
    );
  });

  it('applies the published 13% rate and 6 feeds for Starter 100', () => {
    const plan = calculateFeedPlan(starter, 500)!;
    expect(plan.dailyVolumeMaxMl).toBe(65);
    expect(plan.feedsPerDay).toBe(6);
    expect(plan.perFeedMaxMl).toBeCloseTo(10.8, 1);
  });

  it('calculates powder at the published mixing ratio', () => {
    // Flying fox: 14g powder made up to 70mL, so 25mL needs 5g.
    const plan = calculateFeedPlan(flyingFox, 100)!;
    expect(plan.powderForDayGrams).toBe(5);
    // Starter 100: 16g to 100mL, so 65mL needs 10.4g.
    const s = calculateFeedPlan(starter, 500)!;
    expect(s.powderForDayGrams).toBeCloseTo(10.4, 1);
  });

  it('honours a carer-chosen feed frequency within the published range', () => {
    const four = calculateFeedPlan(flyingFox, 100, 4)!;
    const five = calculateFeedPlan(flyingFox, 100, 5)!;
    expect(four.dailyVolumeMaxMl).toBe(five.dailyVolumeMaxMl);
    expect(four.perFeedMaxMl).toBeGreaterThan(five.perFeedMaxMl);
  });

  it('rejects nonsense weights rather than returning a plausible number', () => {
    expect(calculateFeedPlan(flyingFox, 0)).toBeNull();
    expect(calculateFeedPlan(flyingFox, -50)).toBeNull();
    expect(calculateFeedPlan(flyingFox, NaN)).toBeNull();
    expect(calculateFeedPlan(flyingFox, 100, 0)).toBeNull();
  });
});

describe('formula suggestions', () => {
  it('points bats at the flying-fox formula', () => {
    expect(suggestedFormulaIds('Grey-headed Flying-fox')).toEqual(['flying-fox']);
    expect(suggestedFormulaIds("Gould's Wattled Bat")).toEqual(['flying-fox']);
  });

  it('points marsupials at the Stage 1 formulas', () => {
    expect(suggestedFormulaIds('Common Ringtail Possum')).toContain('starter-100');
    expect(suggestedFormulaIds('Eastern Grey Kangaroo')).toContain('starter-100');
  });

  it('returns nothing rather than guessing for species with no published basis', () => {
    expect(suggestedFormulaIds('Tiger Snake')).toEqual([]);
    expect(suggestedFormulaIds('Australian Magpie')).toEqual([]);
  });
});

describe('published figures are cited', () => {
  it('records a manufacturer source for every formula', () => {
    for (const f of BIOLAC_FORMULAS) {
      expect(f.source).toMatch(/biolac\.com\.au/);
    }
  });
});
