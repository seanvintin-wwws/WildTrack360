import { describe, expect, it } from 'vitest';
import { estimateBirthDate } from './growth-utils';
import { ageForForearm } from './feed-alerts';
import { birthDateReference, pinsonAgesSpecies, pinsonReference } from './pinson-ghff-chart';

describe('Birth Date Estimator uses Pinson for Grey-headed', () => {
  it('picks Pinson for Grey-headed only', () => {
    const stored = [{ ...pinsonReference()[0], ageDays: 0, weightGrams: 85 }];
    expect(birthDateReference('Grey-headed Flying Fox', stored)).toEqual(pinsonReference());
    expect(birthDateReference('Little Red Flying-fox', stored)).toBe(stored);
    expect(pinsonAgesSpecies('grey-headed flying-fox')).toBe(true);
    expect(pinsonAgesSpecies(null)).toBe(false);
  });

  it('gives the same age from forearm as the feed emails, for every forearm on the chart', () => {
    const ref = birthDateReference('Grey-headed Flying Fox', []);
    for (let mm = 57.5; mm <= 131.5; mm += 0.5) {
      const est = estimateBirthDate(ref, { armLengthMm: mm }, new Date('2026-11-04T00:00:00Z'));
      expect(est.medianEstimatedAgeDays, `forearm ${mm} mm`).toBe(ageForForearm(mm).ageDays);
    }
  });

  it('ages the two current pups as the feed emails do', () => {
    const ref = birthDateReference('Grey-headed Flying Fox', []);
    expect(estimateBirthDate(ref, { armLengthMm: 82 }, new Date()).medianEstimatedAgeDays).toBe(21);
    expect(estimateBirthDate(ref, { armLengthMm: 74 }, new Date()).medianEstimatedAgeDays).toBe(14);
  });
});
