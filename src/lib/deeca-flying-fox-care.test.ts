import { describe, expect, it } from 'vitest';
import {
  FLYING_FOX_MATURITY,
  GHFF_CARE_TIMELINE,
  LITTLE_RED_TIMELINE,
  SOFT_RELEASE_REQUIREMENTS,
  dailyMilkMl,
  getCareStageForAge,
} from './deeca-flying-fox-care';

describe('DEECA Table 4.7 values', () => {
  it('records a newborn at 85g and 57mm, not the 25g in the seeded curve', () => {
    const newborn = GHFF_CARE_TIMELINE[0];
    expect(newborn.weightGrams).toBe(85);
    expect(newborn.forearmMm).toBe(57);
  });

  it('has weight and forearm rising monotonically', () => {
    for (let i = 1; i < GHFF_CARE_TIMELINE.length; i++) {
      expect(GHFF_CARE_TIMELINE[i].weightGrams).toBeGreaterThan(
        GHFF_CARE_TIMELINE[i - 1].weightGrams
      );
      expect(GHFF_CARE_TIMELINE[i].forearmMm).toBeGreaterThan(
        GHFF_CARE_TIMELINE[i - 1].forearmMm
      );
    }
  });

  it('covers every week from newborn to 16 weeks with no gaps', () => {
    expect(GHFF_CARE_TIMELINE.map((s) => s.ageWeeks)).toEqual(
      Array.from({ length: 17 }, (_, i) => i)
    );
    expect(LITTLE_RED_TIMELINE.map((s) => s.ageWeeks)).toEqual(
      Array.from({ length: 17 }, (_, i) => i)
    );
  });
});

describe('temperature', () => {
  it('starts newborns at 30-32°C', () => {
    expect(getCareStageForAge(0)?.temperatureC).toBe('30–32');
  });

  it('drops to 28°C for older pups', () => {
    expect(getCareStageForAge(14)?.temperatureC).toBe('28');
  });

  it('withdraws artificial heat from five weeks', () => {
    expect(getCareStageForAge(35)?.temperatureC).toBeNull();
    expect(getCareStageForAge(60)?.temperatureC).toBeNull();
  });

  it('carries the last set temperature forward between table rows', () => {
    // Week 6 has no temperature of its own; heat was withdrawn at week 5.
    expect(getCareStageForAge(42)?.temperatureC).toBeNull();
  });
});

describe('feeding', () => {
  it('gives 4mL five times a day for a newborn', () => {
    const s = getCareStageForAge(0)!;
    expect(s.milkMlPerFeed).toBe(4);
    expect(s.feedsPerDayMax).toBe(5);
    expect(dailyMilkMl(s)).toBe(20);
  });

  it('introduces solids at seven weeks', () => {
    expect(getCareStageForAge(49)?.solids).toMatch(/steamed, peeled apple/i);
    expect(getCareStageForAge(42)?.solids).toBeUndefined();
  });

  it('has no milk figure once weaned at twelve weeks', () => {
    const weaned = getCareStageForAge(84)!;
    expect(weaned.milkMlPerFeed).toBeUndefined();
    expect(dailyMilkMl(weaned)).toBeNull();
    expect(weaned.milestone).toMatch(/wean/i);
  });
});

describe('sexual maturity and dimorphism', () => {
  it('places sexual maturity far beyond the rearing window', () => {
    const rearingWeeks = GHFF_CARE_TIMELINE[GHFF_CARE_TIMELINE.length - 1].ageWeeks;
    const maturityWeeks = FLYING_FOX_MATURITY.greyHeaded.sexualMaturityMonthsMin * 4.35;
    // The whole hand-rearing table ends long before dimorphism emerges, which
    // is why DEECA publish it unsexed.
    expect(maturityWeeks).toBeGreaterThan(rearingWeeks * 5);
  });

  it('records adult dimorphism with males heavier than females', () => {
    const g = FLYING_FOX_MATURITY.greyHeaded;
    expect(g.adultMaleMeanGrams).toBeGreaterThan(g.adultFemaleMeanGrams);
    expect(g.adultMaleMeanGrams - g.adultFemaleMeanGrams).toBe(167);
  });

  it('cites Welbergen for the dimorphism figures', () => {
    expect(FLYING_FOX_MATURITY.greyHeaded.dimorphismReference).toMatch(/Welbergen/);
  });
});

describe('release', () => {
  it('requires 15 weeks and three weeks in creche', () => {
    expect(SOFT_RELEASE_REQUIREMENTS.minimumAgeWeeks).toBe(15);
    expect(SOFT_RELEASE_REQUIREMENTS.minimumCrecheWeeks).toBe(3);
  });

  it('flags the earliest release age on the timeline itself', () => {
    expect(getCareStageForAge(15 * 7)?.milestone).toMatch(/soft release/i);
  });
});

describe('refusals', () => {
  it('returns null for impossible ages', () => {
    expect(getCareStageForAge(-1)).toBeNull();
    expect(getCareStageForAge(NaN)).toBeNull();
  });

  it('holds at the last published stage beyond the table', () => {
    const beyond = getCareStageForAge(365)!;
    expect(beyond.ageWeeks).toBe(16);
  });
});
