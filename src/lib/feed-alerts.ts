/**
 * Daily flying-fox feed-volume alerts.
 *
 * Each morning, work out every in-care grey-headed flying-fox's milk-for-age
 * and email the carers when any pup's volume or feed split changes.
 *
 * SOURCES (both charts read from the PDFs' own text layer, every value)
 * - Goat's milk: Pinson & Kerr, "Milk Replacer Chart for Grey-headed & Black
 *   Flying-foxes" (cow's milk chart), released 4 Oct 2009, updated 1 Feb 2019.
 *   The Flying-fox Manual v3 s3.024 says this chart is used for goat's milk.
 * - Biolac: Pinson & Kerr, "Biolac Flying Fox Chart v3".
 *   Both: ff-manual PDFs, Resources folder. Every schedule sums to its daily
 *   total (tested); the weekly rows are pinned in tests.
 *
 * AGE (Flying-fox Manual v3 s3.024 and s3.027)
 * "Age is determined by forearm length on intake", then counted on day by day.
 * So age = the day on Pinson's chart matching the pup's FIRST recorded
 * forearm, plus the days since that measurement. Pinson's forearm column is
 * identical on both charts. A pup with no forearm recorded falls back to its
 * date of birth, and the email says so.
 */

import { PINSON_GHFF_CHART } from './pinson-ghff-chart';

export type AlertFormula = 'goats-milk' | 'biolac';

/** [ageDay, mLPerDay, schedule (mL per feed, earliest feed first)] */
type FeedRow = [number, number, number[]];

/** Cow's milk chart (used for goat's milk), days 1-78. Day 79 on: weaned. */
export const PINSON_COWS_FEED_CHART: FeedRow[] = [
  [1, 23, [4, 4, 5, 5, 5]],
  [2, 24, [4, 5, 5, 5, 5]],
  [3, 24, [4, 5, 5, 5, 5]],
  [4, 25, [5, 5, 5, 5, 5]],
  [5, 25, [5, 5, 5, 5, 5]],
  [6, 26, [5, 5, 5, 5, 6]],
  [7, 26, [5, 5, 5, 5, 6]],
  [8, 27, [5, 5, 5, 6, 6]],
  [9, 27, [5, 5, 5, 6, 6]],
  [10, 28, [5, 5, 6, 6, 6]],
  [11, 29, [5, 6, 6, 6, 6]],
  [12, 29, [5, 6, 6, 6, 6]],
  [13, 30, [6, 6, 6, 6, 6]],
  [14, 31, [6, 6, 6, 6, 7]],
  [15, 32, [6, 6, 6, 7, 7]],
  [16, 33, [6, 6, 7, 7, 7]],
  [17, 33, [6, 6, 7, 7, 7]],
  [18, 34, [6, 7, 7, 7, 7]],
  [19, 35, [7, 7, 7, 7, 7]],
  [20, 36, [7, 7, 7, 7, 8]],
  [21, 36, [7, 7, 7, 7, 8]],
  [22, 37, [7, 7, 7, 8, 8]],
  [23, 38, [7, 7, 8, 8, 8]],
  [24, 38, [7, 7, 8, 8, 8]],
  [25, 39, [7, 8, 8, 8, 8]],
  [26, 40, [8, 8, 8, 8, 8]],
  [27, 40, [8, 8, 8, 8, 8]],
  [28, 41, [10, 10, 10, 11]],
  [29, 42, [10, 10, 11, 11]],
  [30, 42, [10, 10, 11, 11]],
  [31, 43, [10, 11, 11, 11]],
  [32, 44, [11, 11, 11, 11]],
  [33, 44, [11, 11, 11, 11]],
  [34, 45, [11, 11, 11, 12]],
  [35, 46, [11, 11, 12, 12]],
  [36, 46, [11, 11, 12, 12]],
  [37, 47, [11, 12, 12, 12]],
  [38, 48, [12, 12, 12, 12]],
  [39, 48, [12, 12, 12, 12]],
  [40, 49, [12, 12, 12, 13]],
  [41, 49, [12, 12, 12, 13]],
  [42, 50, [12, 12, 13, 13]],
  [43, 50, [12, 12, 13, 13]],
  [44, 51, [12, 13, 13, 13]],
  [45, 51, [12, 13, 13, 13]],
  [46, 52, [13, 13, 13, 13]],
  [47, 52, [13, 13, 13, 13]],
  [48, 53, [13, 13, 13, 14]],
  [49, 53, [13, 13, 13, 14]],
  [50, 54, [13, 13, 14, 14]],
  [51, 54, [13, 13, 14, 14]],
  [52, 54, [13, 13, 14, 14]],
  [53, 55, [13, 14, 14, 14]],
  [54, 55, [13, 14, 14, 14]],
  [55, 56, [14, 14, 14, 14]],
  [56, 56, [14, 14, 14, 14]],
  [57, 56, [14, 14, 14, 14]],
  [58, 57, [14, 14, 14, 15]],
  [59, 57, [14, 14, 14, 15]],
  [60, 57, [14, 14, 14, 15]],
  [61, 58, [14, 14, 15, 15]],
  [62, 58, [14, 14, 15, 15]],
  [63, 58, [14, 14, 15, 15]],
  [64, 59, [14, 15, 15, 15]],
  [65, 59, [14, 15, 15, 15]],
  [66, 59, [14, 15, 15, 15]],
  [67, 60, [15, 15, 15, 15]],
  [68, 60, [15, 15, 15, 15]],
  [69, 60, [15, 15, 15, 15]],
  [70, 45, [15, 15, 15]],
  [71, 45, [15, 15, 15]],
  [72, 45, [15, 15, 15]],
  [73, 30, [15, 15]],
  [74, 30, [15, 15]],
  [75, 30, [15, 15]],
  [76, 15, [15]],
  [77, 15, [15]],
  [78, 15, [15]],
];

/** Biolac Flying Fox chart v3, days 1-78. Day 79 on: weaned. */
export const PINSON_FEED_CHART: FeedRow[] = [
  [1, 18, [3, 3, 4, 4, 4]],
  [2, 18, [3, 3, 4, 4, 4]],
  [3, 18, [3, 3, 4, 4, 4]],
  [4, 19, [3, 4, 4, 4, 4]],
  [5, 19, [3, 4, 4, 4, 4]],
  [6, 19, [3, 4, 4, 4, 4]],
  [7, 20, [4, 4, 4, 4, 4]],
  [8, 20, [4, 4, 4, 4, 4]],
  [9, 20, [4, 4, 4, 4, 4]],
  [10, 21, [4, 4, 4, 4, 5]],
  [11, 21, [4, 4, 4, 4, 5]],
  [12, 21, [4, 4, 4, 4, 5]],
  [13, 22, [4, 4, 4, 5, 5]],
  [14, 22, [4, 4, 4, 5, 5]],
  [15, 23, [4, 4, 5, 5, 5]],
  [16, 23, [4, 4, 5, 5, 5]],
  [17, 24, [4, 5, 5, 5, 5]],
  [18, 25, [5, 5, 5, 5, 5]],
  [19, 25, [5, 5, 5, 5, 5]],
  [20, 26, [5, 5, 5, 5, 6]],
  [21, 26, [5, 5, 5, 5, 6]],
  [22, 27, [5, 5, 5, 6, 6]],
  [23, 27, [5, 5, 5, 6, 6]],
  [24, 28, [5, 5, 6, 6, 6]],
  [25, 28, [5, 5, 6, 6, 6]],
  [26, 29, [5, 6, 6, 6, 6]],
  [27, 30, [6, 6, 6, 6, 6]],
  [28, 31, [7, 8, 8, 8]],
  [29, 31, [7, 8, 8, 8]],
  [30, 32, [8, 8, 8, 8]],
  [31, 33, [8, 8, 8, 9]],
  [32, 34, [8, 8, 9, 9]],
  [33, 34, [8, 8, 9, 9]],
  [34, 35, [8, 9, 9, 9]],
  [35, 36, [9, 9, 9, 9]],
  [36, 37, [9, 9, 9, 10]],
  [37, 38, [9, 9, 10, 10]],
  [38, 38, [9, 9, 10, 10]],
  [39, 39, [9, 10, 10, 10]],
  [40, 40, [10, 10, 10, 10]],
  [41, 41, [10, 10, 10, 11]],
  [42, 42, [10, 10, 11, 11]],
  [43, 42, [10, 10, 11, 11]],
  [44, 43, [10, 11, 11, 11]],
  [45, 44, [11, 11, 11, 11]],
  [46, 45, [11, 11, 11, 12]],
  [47, 46, [11, 11, 12, 12]],
  [48, 47, [11, 12, 12, 12]],
  [49, 48, [12, 12, 12, 12]],
  [50, 49, [12, 12, 12, 13]],
  [51, 50, [12, 12, 13, 13]],
  [52, 51, [12, 13, 13, 13]],
  [53, 51, [12, 13, 13, 13]],
  [54, 52, [13, 13, 13, 13]],
  [55, 53, [13, 13, 13, 14]],
  [56, 54, [13, 13, 14, 14]],
  [57, 55, [13, 14, 14, 14]],
  [58, 56, [14, 14, 14, 14]],
  [59, 57, [14, 14, 14, 15]],
  [60, 58, [14, 14, 15, 15]],
  [61, 59, [14, 15, 15, 15]],
  [62, 60, [15, 15, 15, 15]],
  [63, 60, [15, 15, 15, 15]],
  [64, 60, [15, 15, 15, 15]],
  [65, 60, [15, 15, 15, 15]],
  [66, 60, [15, 15, 15, 15]],
  [67, 60, [15, 15, 15, 15]],
  [68, 60, [15, 15, 15, 15]],
  [69, 60, [15, 15, 15, 15]],
  [70, 45, [15, 15, 15]],
  [71, 45, [15, 15, 15]],
  [72, 45, [15, 15, 15]],
  [73, 30, [15, 15]],
  [74, 30, [15, 15]],
  [75, 30, [15, 15]],
  [76, 15, [15]],
  [77, 15, [15]],
  [78, 15, [15]],
];

/** Weaned from day 79 on the chart. */
export const WEANED_FROM_DAY = 79;

/** Each chart's own stage notes, keyed by the day they appear. */
export const CHART_MILESTONES: Record<AlertFormula, Record<number, string>> = {
  'goats-milk': {
    14: 'Start the transition to feeding for age.',
    21: 'All orphans should now be drinking the volume of milk for their age.',
    28: 'Reduce from 5 feeds a day to 4.',
    49: 'Introduce fruit.',
    70: 'Start adding powder to fruit.',
    79: 'All orphans should now be weaned and eating appropriately sized fruit, ready for crèche.',
  },
  biolac: {
    1: 'Feed for weight; offer the volume only, never force.',
    14: 'Start the transition to feeding for age.',
    21: 'All orphans should now be drinking the volume of milk for their age.',
    28: 'Reduce from 5 feeds a day to 4.',
    49: 'Introduce fruit (apple only).',
    62: 'Maximum volume per feed reached: 15 mL.',
    70: 'Weaning: start adding powder to fruit.',
    79: 'All orphans now weaned, and eating appropriately sized fruit, ready for crèche.',
  },
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

export function feedPlanForAge(ageDays: number, formula: AlertFormula): FeedPlanForAge {
  const day = Math.max(1, ageDays);
  const milestone = CHART_MILESTONES[formula][day] ?? null;
  if (day >= WEANED_FROM_DAY) {
    return { ageDays, weaned: true, dailyMl: 0, schedule: [], feedsPerDay: 0, milestone };
  }
  const chart = formula === 'goats-milk' ? PINSON_COWS_FEED_CHART : PINSON_FEED_CHART;
  const [, dailyMl, schedule] = chart.find((r) => r[0] === day)!;
  return { ageDays, weaned: false, dailyMl, schedule: [...schedule], feedsPerDay: schedule.length, milestone };
}

/**
 * Age in days on Pinson's chart for a forearm length: the first day whose
 * forearm reaches it, interpolated from the day before and rounded to the
 * nearest day. Clamped to the chart's range (day 1 to day 112).
 */
export function ageForForearm(forearmMm: number): { ageDays: number; outsideChart: boolean } {
  const c = PINSON_GHFF_CHART;
  if (forearmMm <= c[0][1]) return { ageDays: c[0][0], outsideChart: forearmMm < c[0][1] };
  const last = c[c.length - 1];
  if (forearmMm > last[1]) return { ageDays: last[0], outsideChart: true };
  for (let i = 1; i < c.length; i++) {
    const [d, fa] = c[i];
    if (fa >= forearmMm) {
      if (fa === forearmMm) {
        // first day the chart reaches this exact forearm
        let j = i;
        while (j > 0 && c[j - 1][1] === forearmMm) j--;
        return { ageDays: c[j][0], outsideChart: false };
      }
      const [pd, pfa] = c[i - 1];
      return { ageDays: Math.round(pd + ((forearmMm - pfa) / (fa - pfa)) * (d - pd)), outsideChart: false };
    }
  }
  return { ageDays: last[0], outsideChart: true };
}

/** Chart forearm for an age, for comparing with the latest measurement. */
export function chartForearmForAge(ageDays: number): number | null {
  return PINSON_GHFF_CHART.find((r) => r[0] === ageDays)?.[1] ?? null;
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
  /** Growth measurements, any order. Only forearm is used here. */
  measurements?: { date: Date; armLengthMm: number | null }[];
}

export interface AgeBasis {
  ageDays: number;
  source: 'intake-forearm' | 'date-of-birth';
  intakeForearmMm?: number;
  intakeDate?: string;
  latestForearmMm?: number;
  latestDate?: string;
  outsideChart?: boolean;
}

/** Age today following the manual: from the first forearm recorded, else date of birth. */
export function resolveAge(a: AlertAnimal, today: string): AgeBasis | null {
  const fa = (a.measurements ?? [])
    .filter((m) => m.armLengthMm != null && m.armLengthMm > 0)
    .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());
  if (fa.length > 0) {
    const first = fa[0];
    const latest = fa[fa.length - 1];
    const intakeDate = sydneyDate(new Date(first.date));
    const { ageDays, outsideChart } = ageForForearm(first.armLengthMm as number);
    return {
      ageDays: ageDays + daysBetweenDates(intakeDate, today),
      source: 'intake-forearm',
      intakeForearmMm: first.armLengthMm as number,
      intakeDate,
      latestForearmMm: latest.armLengthMm as number,
      latestDate: sydneyDate(new Date(latest.date)),
      outsideChart,
    };
  }
  if (a.dateOfBirth) {
    return { ageDays: daysBetweenDates(sydneyDate(a.dateOfBirth), today), source: 'date-of-birth' };
  }
  return null;
}

export interface AlertLine {
  name: string;
  orgAnimalId: string | null;
  today: FeedPlanForAge | null;
  basis: AgeBasis | null;
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

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${Number(d)}/${Number(m)}/${y}`;
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
    const basis = resolveAge(a, today);
    if (!basis) return { name: a.name, orgAnimalId: a.orgAnimalId, today: null, basis: null, changed: false };
    const t = feedPlanForAge(basis.ageDays, formula);
    const y = feedPlanForAge(basis.ageDays - 1, formula);
    return { name: a.name, orgAnimalId: a.orgAnimalId, today: t, basis, changed: plansDiffer(t, y) || !!t.milestone };
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
      textLines.push(`${l.name}${id}: no forearm or date of birth recorded, can't work out age.`);
      htmlRows.push(`<tr><td><b>${l.name}</b>${id}</td><td colspan="2">No forearm or date of birth recorded, can't work out age.</td></tr>`);
      continue;
    }
    const p = l.today;
    const times = FEED_TIMES[p.feedsPerDay] ? ` at ${FEED_TIMES[p.feedsPerDay]}` : '';
    const flag = l.changed ? 'CHANGED: ' : '';
    textLines.push(`${flag}${l.name}${id}, day ${p.ageDays}: ${describe(p)}${p.weaned ? '' : times}`);
    const b = l.basis!;
    const ageNote =
      b.source === 'intake-forearm'
        ? `Age from intake forearm ${b.intakeForearmMm} mm on ${fmtDate(b.intakeDate!)}${b.outsideChart ? ' (outside the chart, check)' : ''}.` +
          (b.latestDate !== b.intakeDate
            ? ` Latest forearm ${b.latestForearmMm} mm on ${fmtDate(b.latestDate!)}; chart forearm for day ${p.ageDays} is ${chartForearmForAge(p.ageDays) ?? 'n/a'} mm.`
            : '')
        : 'No forearm recorded: age is from the date of birth in WildTrack360.';
    textLines.push(`   ${ageNote}`);
    if (p.milestone) textLines.push(`   Chart note: ${p.milestone}`);
    htmlRows.push(
      `<tr style="${l.changed ? 'background:#fff7d6' : ''}"><td><b>${l.name}</b>${id}${l.changed ? ' <span style="color:#b45309">changed</span>' : ''}</td><td>day ${p.ageDays}</td><td>${describe(p)}${p.weaned ? '' : `<br><span style="color:#666">${times.replace(' at ', '')}</span>`}<br><span style="color:#666;font-size:12px">${ageNote}</span>${p.milestone ? `<br><i>Chart note: ${p.milestone}</i>` : ''}</td></tr>`
    );
  }

  const recipe =
    formula === 'goats-milk' && totalToday > 0
      ? `Make up for today (all pups, ${Math.round(totalToday)} mL): ${goatRecipeFor(Math.ceil(totalToday))}.`
      : '';
  const derived =
    formula === 'goats-milk'
      ? "Volumes: Pinson & Kerr Milk Replacer Chart (cow's milk chart, updated 1 Feb 2019), which the Flying-fox Manual (3.024) uses for goat's milk. Recipe per 100 mL from the Manual (3.021)."
      : 'Volumes: Pinson & Kerr Biolac Flying Fox Chart v3.';
  const footer =
    'These are milk-for-age volumes. Newly arrived pups are fed for their weight until settled, and should be on milk-for-age by the end of their second week in care (Manual 3.026). The chart is a guide only: offer, never force.';

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
