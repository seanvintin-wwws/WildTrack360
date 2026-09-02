/**
 * Selecting a carer's most recent training.
 *
 * The carer list rendered `trainings[0]` under the label "Latest". The query
 * loading them had no orderBy, so the database returned rows in whatever order
 * it liked - in practice insertion order - and a carer whose oldest course was
 * entered first saw their 2021 training shown as "Latest".
 *
 * The query is now ordered, but reading position 0 and calling it the latest
 * still only works by luck. This picks the maximum explicitly, so the label is
 * correct regardless of what order the caller supplies.
 */

export interface TrainingLike {
  courseName: string;
  date: Date | string;
}

function timeOf(value: Date | string): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

/**
 * Most recently dated training, or null when there are none. Entries with an
 * unparseable date are skipped rather than winning the comparison, which is
 * what NaN would otherwise do.
 */
export function latestTraining<T extends TrainingLike>(
  trainings: readonly T[] | null | undefined
): T | null {
  if (!trainings || trainings.length === 0) return null;

  let best: T | null = null;
  let bestTime = Number.NEGATIVE_INFINITY;

  for (const training of trainings) {
    const time = timeOf(training.date);
    if (!Number.isFinite(time)) continue;
    // Strictly greater, so an earlier entry wins a tie and the result is
    // stable for two courses completed in the same month.
    if (time > bestTime) {
      best = training;
      bestTime = time;
    }
  }

  return best;
}

/** Newest first. Does not mutate the input. */
export function sortTrainingsNewestFirst<T extends TrainingLike>(
  trainings: readonly T[]
): T[] {
  return [...trainings].sort((a, b) => timeOf(b.date) - timeOf(a.date));
}
