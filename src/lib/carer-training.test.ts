import { describe, expect, it } from 'vitest';
import { latestTraining, sortTrainingsNewestFirst } from './carer-training';

// The real records that surfaced the bug: fifteen courses entered oldest
// first, where the carer list showed the August 2021 course as "Latest"
// because it happened to be row zero.
const TRAININGS = [
  { courseName: 'Basic Wildlife Rescue and Transport', date: '2021-08-01' },
  { courseName: 'Macropod Rescue', date: '2021-11-01' },
  { courseName: 'Echidna Rescue', date: '2022-06-01' },
  { courseName: 'Captive Bolt and Pole Syringe Training', date: '2022-09-01' },
  { courseName: 'Assist at Wildlife Emergencies (WESN)', date: '2023-09-01' },
  { courseName: 'Emergency Flying Fox Care', date: '2025-12-01' },
  { courseName: 'Microbats - Secret Lives of Our Tiny Night Flyers', date: '2026-07-01' },
];
const NEWEST = 'Microbats - Secret Lives of Our Tiny Night Flyers';

describe('latestTraining', () => {
  it('picks the newest course, not the first in the array', () => {
    expect(latestTraining(TRAININGS)?.courseName).toBe(NEWEST);
  });

  it('gives the same answer whatever order it is handed', () => {
    expect(latestTraining([...TRAININGS].reverse())?.courseName).toBe(NEWEST);
    expect(latestTraining([TRAININGS[3], TRAININGS[6], TRAININGS[0]])?.courseName).toBe(NEWEST);
  });

  it('accepts Date objects as well as strings', () => {
    const withDates = TRAININGS.map((t) => ({ ...t, date: new Date(t.date) }));
    expect(latestTraining(withDates)?.courseName).toBe(NEWEST);
  });

  it('returns null for an empty or missing list', () => {
    expect(latestTraining([])).toBeNull();
    expect(latestTraining(null)).toBeNull();
    expect(latestTraining(undefined)).toBeNull();
  });

  it('keeps the earlier entry when two share a date', () => {
    const sameMonth = [
      { courseName: 'Flying Fox Care', date: '2024-08-01' },
      { courseName: 'Wombat Pinkie Care', date: '2024-08-01' },
    ];
    expect(latestTraining(sameMonth)?.courseName).toBe('Flying Fox Care');
  });

  it('ignores an unparseable date rather than letting it win', () => {
    const withJunk = [...TRAININGS, { courseName: 'Corrupt', date: 'not-a-date' }];
    expect(latestTraining(withJunk)?.courseName).toBe(NEWEST);
  });

  it('returns null when every date is unparseable', () => {
    expect(latestTraining([{ courseName: 'Corrupt', date: 'nope' }])).toBeNull();
  });
});

describe('sortTrainingsNewestFirst', () => {
  it('orders newest to oldest', () => {
    const sorted = sortTrainingsNewestFirst(TRAININGS);
    expect(sorted[0].date).toBe('2026-07-01');
    expect(sorted[sorted.length - 1].date).toBe('2021-08-01');
  });

  it('does not mutate the input', () => {
    const original = [...TRAININGS];
    sortTrainingsNewestFirst(TRAININGS);
    expect(TRAININGS).toEqual(original);
  });
});
