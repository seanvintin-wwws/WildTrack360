import { describe, expect, it } from 'vitest';
import { VicReportGenerator } from './vic-report-generator';
import { lookupVicSpeciesCode } from './vic-species-codes';
import {
  VIC_CAUSE_CODES,
  VIC_FATE_CATEGORY,
  VIC_FATE_REQUIRES_APPROVAL,
  VIC_INJURY_CODES,
  getVicAgeCodesForGroup,
} from './vic-picklists';

// Minimal Animal-shaped fixture. The generator only reads a handful of
// columns, so we cast rather than construct the full Prisma model.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function animal(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'cuid-1',
    name: 'Joey',
    species: 'Eastern Grey Kangaroo',
    sex: 'Female',
    orgAnimalId: '26/001',
    dateFound: new Date('2026-03-12'),
    dateAdmitted: null,
    outcomeDate: null,
    dateReleased: null,
    rescueLocation: 'Yarra Bend Park',
    rescueAddress: null,
    releaseLocation: null,
    releasePostcode: null,
    notes: null,
    vicAgeCode: 'P',
    vicInjuryCode: 'O',
    vicCauseCode: '40',
    vicFateCode: null,
    vicFoundRef: '-37.7930, 145.0100',
    ...overrides,
  };
}

describe('VIC species codes', () => {
  it('resolves known species to their Wildlife Code Book code', () => {
    expect(lookupVicSpeciesCode('Eastern Grey Kangaroo')).toBe('1265');
    expect(lookupVicSpeciesCode('Common Ringtail Possum')).toBe('1129');
    expect(lookupVicSpeciesCode('Grey-headed Flying-fox')).toBe('1280');
    expect(lookupVicSpeciesCode('Tiger Snake')).toBe('2681');
  });

  it('is case and whitespace insensitive', () => {
    expect(lookupVicSpeciesCode('  eastern grey kangaroo ')).toBe('1265');
  });

  it('returns undefined for species not in the code book', () => {
    expect(lookupVicSpeciesCode('Bilby')).toBeUndefined();
  });
});

describe('VIC picklists', () => {
  it('uses different age code sets per animal group', () => {
    expect(getVicAgeCodesForGroup('bird').map((c) => c.code)).toEqual([
      'C',
      'J',
      'M',
    ]);
    expect(getVicAgeCodesForGroup('mammal').map((c) => c.code)).toEqual([
      'P',
      'D',
      'S',
      'A',
    ]);
    expect(getVicAgeCodesForGroup('reptile-amphibian').map((c) => c.code)).toEqual(
      ['H', 'O']
    );
  });

  it('flags only the transfer fates that need prior DEECA approval', () => {
    expect(VIC_FATE_REQUIRES_APPROVAL.has('91')).toBe(true);
    expect(VIC_FATE_REQUIRES_APPROVAL.has('92')).toBe(true);
    expect(VIC_FATE_REQUIRES_APPROVAL.has('93')).toBe(true);
    expect(VIC_FATE_REQUIRES_APPROVAL.has('90')).toBe(false);
    expect(VIC_FATE_REQUIRES_APPROVAL.has('80')).toBe(false);
  });

  it('groups fate codes into died/released/transferred', () => {
    expect(VIC_FATE_CATEGORY['70']).toBe('died');
    expect(VIC_FATE_CATEGORY['80']).toBe('released');
    expect(VIC_FATE_CATEGORY['90']).toBe('transferred');
  });

  it('uses two-digit cause codes and single-letter injury codes', () => {
    expect(VIC_CAUSE_CODES.every((c) => /^\d{2}$/.test(c.code))).toBe(true);
    expect(VIC_INJURY_CODES.every((c) => /^[A-Z]$/.test(c.code))).toBe(true);
  });
});

describe('VicReportGenerator.rowsFromAnimals', () => {
  it('maps stored DEECA codes onto record sheet rows', () => {
    const [row] = VicReportGenerator.rowsFromAnimals([animal()]);
    expect(row.caseNumber).toBe('26/001');
    expect(row.sex).toBe('F');
    expect(row.ageCode).toBe('P');
    expect(row.injuryCode).toBe('O');
    expect(row.causeCode).toBe('40');
    expect(row.foundLocation).toBe('Yarra Bend Park');
    expect(row.foundGpsOrMelways).toBe('-37.7930, 145.0100');
  });

  it('normalises sex to M/F/U', () => {
    const rows = VicReportGenerator.rowsFromAnimals([
      animal({ sex: 'Male' }),
      animal({ sex: 'female' }),
      animal({ sex: null }),
      animal({ sex: 'Unknown' }),
    ]);
    expect(rows.map((r) => r.sex)).toEqual(['M', 'F', 'U', 'U']);
  });

  it('prefers dateAdmitted over dateFound for DATE IN', () => {
    const [row] = VicReportGenerator.rowsFromAnimals([
      animal({ dateAdmitted: new Date('2026-03-14') }),
    ]);
    expect(row.dateIn).toEqual(new Date('2026-03-14'));
  });

  it('falls back to the internal id when no case number is assigned', () => {
    const [row] = VicReportGenerator.rowsFromAnimals([
      animal({ orgAnimalId: null }),
    ]);
    expect(row.caseNumber).toBe('cuid-1');
  });

  it('puts release location and postcode in NOTES for released animals', () => {
    const [row] = VicReportGenerator.rowsFromAnimals([
      animal({
        vicFateCode: '80',
        releaseLocation: 'Yarra Bend Park',
        releasePostcode: '3078',
        outcomeDate: new Date('2026-06-01'),
      }),
    ]);
    expect(row.fateCode).toBe('80');
    expect(row.notes).toBe('Yarra Bend Park 3078');
    expect(row.dateOut).toEqual(new Date('2026-06-01'));
  });

  it('still emits a row when coded fields are missing, so gaps stay visible', () => {
    const [row] = VicReportGenerator.rowsFromAnimals([
      animal({
        vicAgeCode: null,
        vicInjuryCode: null,
        vicCauseCode: null,
        vicFoundRef: null,
      }),
    ]);
    expect(row.ageCode).toBe('');
    expect(row.injuryCode).toBe('');
    expect(row.causeCode).toBe('');
    expect(row.foundGpsOrMelways).toBeUndefined();
  });
});
