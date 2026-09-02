import { describe, expect, it } from 'vitest';
import {
  ADEQUATE_TITRE_MINIMUM,
  addMonths,
  assessTitreValue,
  getTitreStatus,
  isCoveredForBatWork,
  isLapsed,
  needsAttention,
  TITRE_INTERVAL_MONTHS,
} from './ablv-titre';

const TEST_DATE = new Date(2026, 0, 15);
const DUE_DATE = new Date(2027, 0, 15);

function daysBefore(days: number): Date {
  const d = new Date(DUE_DATE.getTime());
  d.setDate(d.getDate() - days);
  return d;
}

describe('addMonths', () => {
  it('adds whole months', () => {
    expect(addMonths(new Date(2026, 0, 15), 12)).toEqual(new Date(2027, 0, 15));
  });

  it('clamps to the end of a shorter month rather than rolling over', () => {
    expect(addMonths(new Date(2026, 7, 31), 6)).toEqual(new Date(2027, 1, 28));
  });

  it('handles 29 February into a non-leap year', () => {
    expect(addMonths(new Date(2028, 1, 29), 12)).toEqual(new Date(2029, 1, 28));
  });
});

describe('getTitreStatus - due date', () => {
  it('sets the next test one year after the last', () => {
    expect(TITRE_INTERVAL_MONTHS).toBe(12);
    expect(getTitreStatus(TEST_DATE, TEST_DATE).dueDate).toEqual(DUE_DATE);
  });
});

describe('getTitreStatus - reminder ladder', () => {
  it('is quiet when comfortably current', () => {
    const status = getTitreStatus(TEST_DATE, daysBefore(200));
    expect(status.stage).toBe('ok');
    expect(needsAttention(status.stage)).toBe(false);
  });

  it('gives three months notice', () => {
    expect(getTitreStatus(TEST_DATE, daysBefore(92)).stage).toBe('due-in-3-months');
    expect(getTitreStatus(TEST_DATE, daysBefore(93)).stage).toBe('ok');
  });

  it('escalates at one month', () => {
    expect(getTitreStatus(TEST_DATE, daysBefore(31)).stage).toBe('due-in-1-month');
    expect(getTitreStatus(TEST_DATE, daysBefore(32)).stage).toBe('due-in-3-months');
  });

  it('escalates at two weeks', () => {
    expect(getTitreStatus(TEST_DATE, daysBefore(14)).stage).toBe('due-in-2-weeks');
    expect(getTitreStatus(TEST_DATE, daysBefore(15)).stage).toBe('due-in-1-month');
  });

  it('escalates at one week', () => {
    expect(getTitreStatus(TEST_DATE, daysBefore(7)).stage).toBe('due-in-1-week');
    expect(getTitreStatus(TEST_DATE, daysBefore(8)).stage).toBe('due-in-2-weeks');
  });

  it('says due, not overdue, on the day itself', () => {
    const status = getTitreStatus(TEST_DATE, DUE_DATE);
    expect(status.message).toBe('ABLV titre due today');
    expect(isLapsed(status.stage)).toBe(false);
  });

  it('goes overdue the day after', () => {
    const status = getTitreStatus(TEST_DATE, new Date(2027, 0, 16));
    expect(status.stage).toBe('overdue');
    expect(isLapsed(status.stage)).toBe(true);
    expect(status.message).toContain('overdue by 1 day');
  });

  it('ignores time of day so an evening check does not skip a stage', () => {
    const morning = new Date(2027, 0, 8, 6, 0);
    const evening = new Date(2027, 0, 8, 23, 30);
    expect(getTitreStatus(TEST_DATE, morning).stage).toBe(
      getTitreStatus(TEST_DATE, evening).stage
    );
  });

  it('treats every stage before overdue as still current', () => {
    for (const days of [92, 31, 14, 7, 0]) {
      expect(isLapsed(getTitreStatus(TEST_DATE, daysBefore(days)).stage)).toBe(false);
    }
  });
});

describe('assessTitreValue', () => {
  it('uses the provider threshold of 1.0', () => {
    expect(ADEQUATE_TITRE_MINIMUM).toBe(1.0);
  });

  it('treats the threshold itself as adequate', () => {
    expect(assessTitreValue(1.0)).toBe('adequate');
  });

  it('treats higher results as adequate', () => {
    expect(assessTitreValue(4.0)).toBe('adequate');
    expect(assessTitreValue(1.01)).toBe('adequate');
  });

  it('treats results below the threshold as inadequate', () => {
    expect(assessTitreValue(0.99)).toBe('inadequate');
    expect(assessTitreValue(0.5)).toBe('inadequate');
    expect(assessTitreValue(0)).toBe('inadequate');
  });

  it('rejects a value that is not a number', () => {
    expect(() => assessTitreValue(Number.NaN)).toThrow(/finite/i);
  });
});

describe('isCoveredForBatWork', () => {
  const current = getTitreStatus(TEST_DATE, daysBefore(200)).stage;
  const lapsed = getTitreStatus(TEST_DATE, new Date(2027, 5, 1)).stage;

  it('covers a current test with an adequate result', () => {
    expect(isCoveredForBatWork(current, 4.0)).toBe(true);
  });

  it('does not cover an adequate result on a lapsed test', () => {
    expect(isCoveredForBatWork(lapsed, 4.0)).toBe(false);
  });

  it('does not cover a current test with a low result', () => {
    expect(isCoveredForBatWork(current, 0.4)).toBe(false);
  });

  it('does not cover a carer with no result recorded', () => {
    expect(isCoveredForBatWork(current, null)).toBe(false);
    expect(isCoveredForBatWork(current, undefined)).toBe(false);
  });
});
