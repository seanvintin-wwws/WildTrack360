import { describe, expect, it } from 'vitest';
import {
  highestSequenceUsed,
  reconciledNextValue,
  sequenceFromAnimalId,
} from './highest-used';

// The real IDs, after the four possums were renumbered to match case numbers
// 68-71 on the DEECA intake spreadsheet.
const IN_USE = ['ORG-2026-0068', 'ORG-2026-0069', 'ORG-2026-0070', 'ORG-2026-0071'];

describe('sequenceFromAnimalId', () => {
  it('reads the trailing sequence', () => {
    expect(sequenceFromAnimalId('ORG-2026-0068')).toBe(68);
    expect(sequenceFromAnimalId('ORG-2026-0004')).toBe(4);
  });

  it('handles templates without zero padding', () => {
    expect(sequenceFromAnimalId('WWWS-2026-7')).toBe(7);
  });

  it('takes the last number, not the year', () => {
    expect(sequenceFromAnimalId('ORG-2026-0001')).toBe(1);
  });

  it('returns null rather than zero when there is no sequence', () => {
    expect(sequenceFromAnimalId('KANG-ORG')).toBeNull();
    expect(sequenceFromAnimalId('')).toBeNull();
    expect(sequenceFromAnimalId(null)).toBeNull();
    expect(sequenceFromAnimalId(undefined)).toBeNull();
  });
});

describe('highestSequenceUsed', () => {
  it('finds the highest across real IDs', () => {
    expect(highestSequenceUsed(IN_USE)).toBe(71);
  });

  it('ignores unparseable entries', () => {
    expect(highestSequenceUsed([...IN_USE, 'NO-SEQUENCE', null, undefined])).toBe(71);
  });

  it('returns 0 for an empty list', () => {
    expect(highestSequenceUsed([])).toBe(0);
  });
});

describe('reconciledNextValue', () => {
  it('jumps the counter past manually renumbered IDs', () => {
    expect(reconciledNextValue(5, 71)).toBe(72);
  });

  it('leaves a counter that is already ahead alone', () => {
    expect(reconciledNextValue(80, 71)).toBe(80);
  });

  it('is a no-op when the counter is exactly right', () => {
    expect(reconciledNextValue(72, 71)).toBe(72);
  });

  it('handles a fresh organisation with no animals', () => {
    expect(reconciledNextValue(1, 0)).toBe(1);
  });
});
