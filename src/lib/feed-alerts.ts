/**
 * Daily flying-fox feed-volume alerts.
 *
 * Each morning, work out every in-care grey-headed flying-fox's feed for its
 * age (age counted from its date of birth, which is set from intake forearm)
 * and email the carers when any pup's volume or schedule changes.
 *
 * FEED DATA
 * Pinson & Kerr, "Biolac Flying-fox Milk v3" (2019), as reproduced in Bat
 * Rescue's Orphan Training Manual p.58: mL per day and the per-feed schedule
 * for each day of age to weaning (day 79). Read visually from the printed
 * chart; every schedule sums to its daily total (tested).
 *
 * GOAT'S MILK
 * Pinson feeds goat's milk from his cow's milk chart, which we don't have.
 * Goat's milk volumes are the Biolac chart scaled by the manual's published
 * totals (3,363 mL cow's chart vs 2,930 mL Biolac, day 1 to weaning: x1.148),
 * each feed rounded to the nearest 0.5 mL. Labelled as derived in the email.
 */

import { GOATS_MILK_VOLUME_FACTOR } from './feed-calculators/flyingFoxChart';

export type AlertFormula = 'goats-milk' | 'biolac';

/** [ageDay, mLPerDay, schedule (mL per feed)] from Pinson & Kerr v3, days 1-79. */
type FeedRow = [number, number, number[]];

const S = (s: string) => s.split(' ').map(Number);
const rows: [number, number, number, string][] = [
  // [fromDay, toDay, mL/day, schedule]
  [1, 3, 18, '3 3 4 4 4'],
  [4, 6, 19, '3 4 4 4 4'],
  [7, 9, 20, '4 4 4 4 4'],
  [10, 12, 21, '4 4 4 4 5'],
  [13, 14, 22, '4 4 4 5 5'],
  [15, 16, 23, '4 4 5 5 5'],
  [17, 17, 24, '4 5 5 5 5'],
  [18, 19, 25, '5 5 5 5 5'],
  [20, 21, 26, '5 5 5 5 6'],
  [22, 23, 27, '5 5 5 6 6'],
  [24, 25, 28, '5 5 6 6 6'],
  [26, 26, 29, '5 6 6 6 6'],
  [27, 27, 30, '6 6 6 6 6'],
  [28, 29, 31, '7 8 8 8'],
  [30, 30, 32, '8 8 8 8'],
  [31, 31, 33, '8 8 8 9'],
  [32, 33, 34, '8 8 9 9'],
  [34, 34, 35, '8 9 9 9'],
  [35, 35, 36, '9 9 9 9'],
  [36, 36, 37, '9 9 9 10'],
  [37, 38, 38, '9 9 10 10'],
  [39, 39, 39, '9 10 10 10'],
  [40, 40, 40, '10 10 10 10'],
  [41, 41, 41, '10 10 10 11'],
  [42, 43, 42, '10 10 11 11'],
  [44, 44, 43, '10 11 11 11'],
  [45, 45, 44, '11 11 11 11'],
  [46, 46, 45, '11 11 11 12'],
  [47, 47, 46, '11 11 12 12'],
  [48, 48, 47, '11 12 12 12'],
  [49, 49, 48, '12 12 12 12'],
  [50, 50, 49, '12 12 12 13'],
  [51, 51, 50, '12 12 13 13'],
  [52, 53, 51, '12 13 13 13'],
  [54, 54, 52, '13 13 13 13'],
  [55, 55, 53, '13 13 13 14'],
  [56, 56, 54, '13 13 14 14'],
  [57, 57, 55, '13 14 14 14'],
  [58, 58, 56, '14 14 14 14'],
  [59, 59, 57, '14 14 14 15'],
  [60, 60, 58, '14 14 15 15'],
  [61, 61, 59, '14 15 15 15'],
  [62, 69, 60, '15 15 15 15'],
  [70, 72, 45, '15 15 15'],
  [73, 75, 30, '15 15'],
  [76, 78, 15, '15'],
];

export const PINSON_FEED_CHART: FeedRow[] = rows.flatMap(([from, to, ml, sched]) =>
  Array.from({ length: to - from + 1 }, (_, i) => [from + i, ml, S(sched)] as FeedRow)
);

/** Weaned from day 79 on the chart. */
export const WEANED_FROM_DAY = 79;

/** Chart notes (Pinson & Kerr v3), keyed by the day they appear. */
export const CHART_MILESTONES: Record<number, string> = {
  1: 'Feed for weight on arrival; offer the volume only, never force.',
  14: 'Start the transition to feeding for age.',
  21: 'All orphans should now be drinking the volume for their age.',
  28: 'Reduce from 5 feeds a day to 4.',
  49: 'Introduce fruit (apple only).',
  62: 'Maximum volume per feed reached: 15 mL.',
  70: 'Weaning: start adding powder to fruit.',
  79: 'Weaned: eating appropriately sized fruit, ready for crèche.',
};

/** Suggested feed times from the chart. */
export const FEED_TIMES: Record<number, string> = {
  5: '7am, 11am, 3pm, 7pm, 11pm',
  4: '7am, 12pm, 5pm, 10pm',
};

export interface FeedPlanForAge {
  ageDays: number;
  weaned: boolean;
  dailyMl: number;
  schedule: number[];
  feedsPerDay: number;
  milestone: string | null;
}

const half = (n: number) => Math.round(n * 2) / 2;

export function feedPlanForAge(ageDays: number, formula: AlertFormula): FeedPlanForAge {
  const day = Math.max(1, ageDays);
  const milestone = CHART_MILESTONES[day] ?? null;
  if (day >= WEANED_FROM_DAY) {
    return { ageDays, weaned: true, dailyMl: 0, schedule: [], feedsPerDay: 0, milestone };
  }
  const row = PINSON_FEED_CHART.find((r) => r[0] === day)!;
  const schedule =
    formula === 'goats-milk' ? row[2].map((ml) => half(ml * GOATS_MILK_VOLUME_FACTOR)) : row[2];
  const dailyMl = Math.round(schedule.reduce((a, b) => a + b, 0) * 10) / 10;
  return { ageDays, weaned: false, dailyMl, schedule, feedsPerDay: schedule.length, milestone };
}

export function plansDiffer(a: FeedPlanForAge, b: FeedPlanForAge): boolean {
  return a.weaned !== b.weaned || a.schedule.join(',') !== b.schedule.join(',');
}

/** Calendar date (YYYY-MM-DD) in Sydney for an instant. */
export function sydneyDate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function sydneyHour(d: Date): number {
  return Number(
    new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', hour: '2-digit', hour12: false }).format(d)
  ) % 24;
}

function daysBetweenDates(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}

export interface AlertAnimal {
  name: string;
  orgAnimalId: string | null;
  dateOfBirth: Date | null;
}

export interface AlertLine {
  name: string;
  orgAnimalId: string | null;
  today: FeedPlanForAge | null;
  changed: boolean;
}

export interface FeedAlert {
  date: string;
  formula: AlertFormula;
  lines: AlertLine[];
  anyChanged: boolean;
  subject: string;
  text: string;
  html: string;
}

const FORMULA_LABEL: Record<AlertFormula, string> = {
  'goats-milk': "goat's milk with additives",
  biolac: 'Biolac Flying Fox',
};

function describe(p: FeedPlanForAge): string {
  if (p.weaned) return 'weaned, no milk';
  const sameAll = p.schedule.every((v) => v === p.schedule[0]);
  const perFeed = sameAll ? `${p.schedule[0]} mL` : p.schedule.map((v) => `${v}`).join(' / ') + ' mL';
  return `${p.dailyMl} mL/day, ${p.feedsPerDay} feeds: ${perFeed}`;
}

function goatRecipeFor(ml: number): string {
  const glucose = Math.round(((ml * 3.5) / 100) * 10) / 10;
  const syrup = Math.round((ml / 100) * 10) / 10;
  return `${ml} mL goat's milk + ${glucose} g Glucodin + ${syrup} mL Troy/Novartis calcium syrup`;
}

export function buildFeedAlert(
  animals: AlertAnimal[],
  now: Date,
  formula: AlertFormula,
  appUrl = 'https://wild-track360.vercel.app'
): FeedAlert {
  const today = sydneyDate(now);
  const lines: AlertLine[] = animals.map((a) => {
    if (!a.dateOfBirth) return { name: a.name, orgAnimalId: a.orgAnimalId, today: null, changed: false };
    const age = daysBetweenDates(sydneyDate(a.dateOfBirth), today);
    const t = feedPlanForAge(age, formula);
    const y = feedPlanForAge(age - 1, formula);
    return { name: a.name, orgAnimalId: a.orgAnimalId, today: t, changed: plansDiffer(t, y) || !!t.milestone };
  });
  const changed = lines.filter((l) => l.changed);
  const anyChanged = changed.length > 0;
  const nice = new Date(today + 'T00:00:00Z').toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

  const subject = anyChanged
    ? `Feed change ${nice}: ${changed
        .map((l) => `${l.name} ${l.today!.weaned ? 'weaned' : `${l.today!.dailyMl} mL/day`}`)
        .join(', ')}`
    : `Feeds ${nice}: no changes`;

  const totalToday = lines.reduce((s, l) => s + (l.today && !l.today.weaned ? l.today.dailyMl : 0), 0);

  const textLines: string[] = [
    `Flying-fox feeds for ${nice} (${FORMULA_LABEL[formula]})`,
    '',
  ];
  const htmlRows: string[] = [];
  for (const l of lines) {
    const id = l.orgAnimalId ? ` (${l.orgAnimalId.replace(/^.*-(\d+)$/, '$1')})` : '';
    if (!l.today) {
      textLines.push(`${l.name}${id}: no date of birth set, can't work out age.`);
      htmlRows.push(`<tr><td><b>${l.name}</b>${id}</td><td colspan="2">No date of birth set, can't work out age.</td></tr>`);
      continue;
    }
    const p = l.today;
    const times = FEED_TIMES[p.feedsPerDay] ? ` at ${FEED_TIMES[p.feedsPerDay]}` : '';
    const flag = l.changed ? 'CHANGED: ' : '';
    textLines.push(`${flag}${l.name}${id}, day ${p.ageDays}: ${describe(p)}${p.weaned ? '' : times}`);
    if (p.milestone) textLines.push(`   Note: ${p.milestone}`);
    htmlRows.push(
      `<tr style="${l.changed ? 'background:#fff7d6' : ''}"><td><b>${l.name}</b>${id}${l.changed ? ' <span style="color:#b45309">changed</span>' : ''}</td><td>day ${p.ageDays}</td><td>${describe(p)}${p.weaned ? '' : `<br><span style="color:#666">${times.replace(' at ', '')}</span>`}${p.milestone ? `<br><i>${p.milestone}</i>` : ''}</td></tr>`
    );
  }

  const recipe =
    formula === 'goats-milk' && totalToday > 0
      ? `Make up for today (all pups, ${Math.round(totalToday)} mL): ${goatRecipeFor(Math.ceil(totalToday))}.`
      : '';
  const derived =
    formula === 'goats-milk'
      ? "Goat's milk volumes are derived: Pinson's Biolac chart scaled up about 15% (Flying-fox Manual totals), not read from his cow's milk chart."
      : '';
  const footer =
    'Age is counted from each pup\'s date of birth in WildTrack360 (set from intake forearm). Volumes: Pinson & Kerr, Biolac Flying-fox Milk chart v3. A guide only: offer, never force, and adjust to appetite and weight gain.';

  textLines.push('', recipe, derived, footer, '', `WildTrack360: ${appUrl}/tools/growth-comparison`);
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
<p><b>Flying-fox feeds for ${nice}</b> (${FORMULA_LABEL[formula]})</p>
<table cellpadding="6" style="border-collapse:collapse;border:1px solid #ddd">${htmlRows.join('')}</table>
${recipe ? `<p>${recipe}</p>` : ''}
<p style="color:#666;font-size:12px">${derived} ${footer}</p>
<p style="font-size:12px"><a href="${appUrl}/tools/growth-comparison">Open WildTrack360 growth comparison</a></p>
</div>`;

  return { date: today, formula, lines, anyChanged, subject, text: textLines.filter((x, i, arr) => x !== '' || arr[i - 1] !== '').join('\n'), html };
}
