import { describe, expect, it } from 'vitest';
import {
  getComplianceRuleById,
  getComplianceRulesForJurisdiction,
} from './compliance-rules';

/**
 * Coverage check against an issued DEECA Shelter Authorisation.
 *
 * The authorisation carries 25 numbered standard conditions. The rule set here
 * previously covered 22 of them: Conditions 1 (species not covered by the
 * authorisation), 2 (directions from Authorised Officers) and 8 (no surgical
 * treatment, scheduled poisons only on advice) were absent, with nothing to
 * surface the gap.
 *
 * Some rules deliberately cover a span of conditions — Conditions 4-5 and 9-11
 * are each a single rule, because they are one obligation expressed over
 * several paragraphs. This test asserts every condition number is accounted
 * for somewhere, not that there is one rule per number.
 */

const VIC_RULES = getComplianceRulesForJurisdiction('VIC');

/** Condition numbers named in each rule's `section` string, e.g. "Conditions 4-5". */
function coveredConditionNumbers(): Set<number> {
  const covered = new Set<number>();

  for (const rule of VIC_RULES) {
    const range = rule.section.match(/Conditions\s+(\d+)\s*-\s*(\d+)/i);
    if (range) {
      for (let n = Number(range[1]); n <= Number(range[2]); n++) covered.add(n);
      continue;
    }
    const single = rule.section.match(/Condition\s+(\d+)/i);
    if (single) covered.add(Number(single[1]));
  }

  return covered;
}

describe('VIC compliance rules — authorisation coverage', () => {
  it('covers all 25 standard conditions', () => {
    const covered = coveredConditionNumbers();
    const missing = Array.from({ length: 25 }, (_, i) => i + 1).filter(
      (n) => !covered.has(n)
    );
    expect(missing).toEqual([]);
  });

  it('does not claim conditions beyond the 25 that exist', () => {
    const beyond = Array.from(coveredConditionNumbers()).filter(
      (n) => n < 1 || n > 25
    );
    expect(beyond).toEqual([]);
  });

  it('lists every species excluded by Condition 1', () => {
    const rule = getComplianceRuleById('vic-1', 'VIC');
    expect(rule).toBeDefined();

    // Checked individually so a partial edit to the list fails loudly. An
    // omission here would silently permit an intake the authorisation forbids.
    for (const species of [
      'whales',
      'dolphins',
      'seals',
      'marine turtles',
      'platypus',
      'fish',
      'deer',
      'quail',
      'pheasants',
      'partridges',
    ]) {
      expect(rule!.description.toLowerCase()).toContain(species);
    }
  });

  it('marks Condition 8 as prohibiting surgery outright', () => {
    const rule = getComplianceRuleById('vic-8', 'VIC');
    expect(rule).toBeDefined();
    expect(rule!.description.toLowerCase()).toContain('surgical');
    expect(rule!.required).toBe(true);
  });

  it('keeps every VIC rule required and scoped to VIC', () => {
    for (const rule of VIC_RULES) {
      expect(rule.jurisdictions).toContain('VIC');
    }
    for (const id of ['vic-1', 'vic-2', 'vic-8']) {
      expect(getComplianceRuleById(id, 'VIC')!.required).toBe(true);
    }
  });

  it('does not leak the new VIC rules into other jurisdictions', () => {
    for (const jurisdiction of ['ACT', 'NSW']) {
      const ids = getComplianceRulesForJurisdiction(jurisdiction).map(
        (r) => r.id
      );
      expect(ids).not.toContain('vic-1');
      expect(ids).not.toContain('vic-8');
    }
  });
});
