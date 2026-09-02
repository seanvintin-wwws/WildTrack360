/**
 * ABLV (Australian Bat Lyssavirus) rabies titre currency for carers.
 *
 * The Shelter Authorisation's Important Information section strongly
 * recommends rabies vaccination for anyone intending to care for flying-foxes
 * or bats. It is not a numbered condition, so this is duty of care rather than
 * DEECA compliance - but a carer whose titre has quietly lapsed is a more
 * consequential problem than several things that ARE conditions.
 */

/** Repeat titre interval agreed with the shelter's provider: annual. */
export const TITRE_INTERVAL_MONTHS = 12;

/**
 * Unit the shelter's pathology provider reports in. Stored and displayed
 * alongside the value rather than converted, so what the app shows always
 * matches what the report says.
 */
export const TITRE_UNIT = 'IU/mL';

/**
 * Minimum titre the provider treats as adequate protection.
 *
 * Confirmed against the provider's reference range: adequate is 1.0 or more.
 * Higher is better - the titre measures antibody present, so adequacy runs at
 * or ABOVE the threshold, not below it. If the provider or lab changes, this
 * number and the direction must come from the pathology report, not memory.
 */
export const ADEQUATE_TITRE_MINIMUM = 1.0;

export type TitreAdequacy = 'adequate' | 'inadequate';

export type TitreAlertStage =
  | 'ok'
  | 'due-in-3-months'
  | 'due-in-1-month'
  | 'due-in-2-weeks'
  | 'due-in-1-week'
  | 'overdue';

export interface TitreStatus {
  stage: TitreAlertStage;
  dueDate: Date;
  daysUntilDue: number;
  message: string;
}

const LADDER: { stage: TitreAlertStage; withinDays: number }[] = [
  { stage: 'due-in-1-week', withinDays: 7 },
  { stage: 'due-in-2-weeks', withinDays: 14 },
  { stage: 'due-in-1-month', withinDays: 31 },
  { stage: 'due-in-3-months', withinDays: 92 },
];

/**
 * Adds whole months, clamping to the end of the target month so a test on
 * 31 August is due 28 February rather than rolling into March.
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const targetMonth = result.getMonth() + months;
  const dayOfMonth = result.getDate();
  result.setDate(1);
  result.setMonth(targetMonth);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(dayOfMonth, lastDay));
  return result;
}

function wholeDaysBetween(from: Date, to: Date): number {
  const startOfDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

export function getTitreStatus(lastTitreDate: Date, asOf: Date = new Date()): TitreStatus {
  const dueDate = addMonths(lastTitreDate, TITRE_INTERVAL_MONTHS);
  const daysUntilDue = wholeDaysBetween(asOf, dueDate);

  if (daysUntilDue < 0) {
    const daysOverdue = Math.abs(daysUntilDue);
    return {
      stage: 'overdue',
      dueDate,
      daysUntilDue,
      message: `ABLV titre overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`,
    };
  }

  const matched = LADDER.find(({ withinDays }) => daysUntilDue <= withinDays);
  if (!matched) {
    return {
      stage: 'ok',
      dueDate,
      daysUntilDue,
      message: `ABLV titre current, next due in ${daysUntilDue} days`,
    };
  }

  return {
    stage: matched.stage,
    dueDate,
    daysUntilDue,
    message:
      daysUntilDue === 0
        ? 'ABLV titre due today'
        : `ABLV titre due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
  };
}

/** Stages that should surface where the carer will see them. */
export function needsAttention(stage: TitreAlertStage): boolean {
  return stage !== 'ok';
}

/** Stages that mean the carer is no longer covered. */
export function isLapsed(stage: TitreAlertStage): boolean {
  return stage === 'overdue';
}

export function assessTitreValue(value: number): TitreAdequacy {
  if (!Number.isFinite(value)) {
    throw new Error('Titre value must be a finite number');
  }
  return value >= ADEQUATE_TITRE_MINIMUM ? 'adequate' : 'inadequate';
}

/**
 * True only when the test is current AND the recorded result clears the
 * threshold. No result recorded counts as not covered: absence of evidence is
 * not evidence of protection.
 */
export function isCoveredForBatWork(
  stage: TitreAlertStage,
  lastTitreValue: number | null | undefined
): boolean {
  if (isLapsed(stage)) return false;
  if (lastTitreValue === null || lastTitreValue === undefined) return false;
  return assessTitreValue(lastTitreValue) === 'adequate';
}
