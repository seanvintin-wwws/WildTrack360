/**
 * Reconciling the animal ID sequence with IDs already in use.
 *
 * The sequence counter lives in its own table and only ever increments as
 * animals are created. If IDs are renumbered by hand - as they were to line the
 * four possums up with case numbers 68-71 on the DEECA intake spreadsheet - the
 * counter is left behind, and the next animal is issued an ID that collides
 * with one already on the record sheet.
 *
 * Rather than adding a screen to type a number into, the allocator takes
 * whichever is higher: the stored counter, or one past the highest sequence
 * actually in use. Renumbering then just works, now and next time.
 */

/**
 * Extracts the trailing sequence number from a rendered animal ID.
 * "ORG-2026-0068" -> 68. Returns null when there is no trailing number, so an
 * unparseable ID is ignored rather than treated as zero.
 */
export function sequenceFromAnimalId(animalId: string | null | undefined): number | null {
  if (!animalId) return null;
  const match = /(\d+)\s*$/.exec(animalId.trim());
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

/** Highest sequence number in use, or 0 when none carry one. */
export function highestSequenceUsed(animalIds: readonly (string | null | undefined)[]): number {
  let highest = 0;
  for (const id of animalIds) {
    const seq = sequenceFromAnimalId(id);
    if (seq !== null && seq > highest) highest = seq;
  }
  return highest;
}

/**
 * The value the counter should hold. Never goes backwards: a counter ahead of
 * the used IDs is left alone, because those numbers may have been issued and
 * the animals since deleted.
 */
export function reconciledNextValue(storedNextValue: number, highestUsed: number): number {
  return Math.max(storedNextValue, highestUsed + 1);
}
