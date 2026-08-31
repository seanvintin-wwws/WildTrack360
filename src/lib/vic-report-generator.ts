import { Animal } from '@prisma/client';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { lookupVicSpeciesCode } from './vic-species-codes';

/**
 * Generates the DEECA Wildlife Shelter Record Sheet export for Victoria.
 *
 * Column layout and field definitions are taken directly from "How to
 * complete your record sheet" at
 * https://www.vic.gov.au/wildlife-rehabilitation-shelters-and-foster-carers
 * and the accompanying Electronic Wildlife Shelter Record Sheet Template
 * (https://www.vic.gov.au/sites/default/files/2020-12/Electronic-Wildlife-Shelter-Record-Sheet-Template.xls).
 *
 * IMPORTANT: Since 2023, DEECA no longer requires annual submission of these
 * records (Condition 23 of the Wildlife Rehabilitator Authorisation Guide).
 * Instead, this export exists so records can be:
 *   - kept for the mandatory 3-year retention period, and
 *   - produced to a Conservation Regulator Authorised Officer "without delay"
 *     if requested during an inspection.
 * This is a genuine difference from the NSW generator, which produces an
 * annual return - the VIC equivalent is an on-demand inspection-ready export.
 */

export interface VicShelterRecordRow {
  caseNumber: string;
  animal: Animal;
  dateIn: Date;
  sex: 'M' | 'F' | 'U';
  ageCode: string;
  injuryCode: string;
  causeCode: string;
  foundLocation: string;
  foundGpsOrMelways?: string;
  dateOut?: Date;
  fateCode?: string;
  notes?: string;
}

export interface VicReportData {
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  organization: {
    name: string;
    authorisationNumber: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  };
  records: VicShelterRecordRow[];
}

export class VicReportGenerator {
  private data: VicReportData;

  constructor(data: VicReportData) {
    this.data = data;
  }

  /**
   * Build record-sheet rows straight from Animal records, mapping the stored
   * DEECA codes and reusing the general-purpose columns the animal form
   * already captures. Animals with no coded fields set still appear, so gaps
   * are visible rather than silently omitted from an inspection export.
   */
  static rowsFromAnimals(animals: Animal[]): VicShelterRecordRow[] {
    return animals.map((animal) => {
      const rawSex = (animal.sex ?? '').trim().toUpperCase();
      const sex: 'M' | 'F' | 'U' =
        rawSex.startsWith('M') ? 'M' : rawSex.startsWith('F') ? 'F' : 'U';

      return {
        // DEECA lets shelters choose their own case numbering (e.g. 16/001);
        // orgAnimalId is WildTrack360's per-organisation identifier, so it is
        // the natural fit. Fall back to the internal id if unset.
        caseNumber: animal.orgAnimalId ?? animal.id,
        animal,
        dateIn: animal.dateAdmitted ?? animal.dateFound,
        sex,
        ageCode: animal.vicAgeCode ?? '',
        injuryCode: animal.vicInjuryCode ?? '',
        causeCode: animal.vicCauseCode ?? '',
        foundLocation: animal.rescueLocation ?? animal.rescueAddress ?? '',
        foundGpsOrMelways: animal.vicFoundRef ?? undefined,
        dateOut: animal.outcomeDate ?? animal.dateReleased ?? undefined,
        fateCode: animal.vicFateCode ?? undefined,
        // For released animals DEECA asks for the release location and
        // postcode in NOTES.
        notes:
          [animal.releaseLocation, animal.releasePostcode]
            .filter(Boolean)
            .join(' ') || animal.notes || undefined,
      };
    });
  }

  private addRowsToSheet(ws: ExcelJS.Worksheet, rows: (string | number | undefined)[][]) {
    for (const row of rows) {
      ws.addRow(row.length === 0 ? [''] : row);
    }
  }

  private setColumnWidths(ws: ExcelJS.Worksheet, widths: number[]) {
    ws.columns = widths.map((width) => ({ width }));
  }

  generateReport(): ExcelJS.Workbook {
    const wb = new ExcelJS.Workbook();
    this.addCoverSheet(wb);
    this.addWildlifeShelterRecordSheet(wb);
    return wb;
  }

  private addCoverSheet(wb: ExcelJS.Workbook) {
    const sheetData = [
      ['Wildlife Shelter Record Sheet Export'],
      [`Records covering: ${format(this.data.reportingPeriod.startDate, 'do MMMM yyyy')} to ${format(this.data.reportingPeriod.endDate, 'do MMMM yyyy')}`],
      [],
      [
        'This export is not an annual return - DEECA no longer requires annual ' +
        'submission of wildlife shelter records (Wildlife Rehabilitator ' +
        'Authorisation Guide, Condition 23). It is a record-keeping export ' +
        'intended to be produced to a Conservation Regulator Authorised ' +
        'Officer on request, and must be retained for at least 3 years.',
      ],
      [],
      [`Organisation: ${this.data.organization.name}`],
      [`Authorisation number: ${this.data.organization.authorisationNumber}`],
      [`Contact: ${this.data.organization.contactName} (${this.data.organization.contactEmail}, ${this.data.organization.contactPhone})`],
      [`Export generated: ${format(new Date(), 'dd/MM/yyyy')}`],
    ];
    const ws = wb.addWorksheet('Cover');
    this.addRowsToSheet(ws, sheetData);
    this.setColumnWidths(ws, [110]);
  }

  private addWildlifeShelterRecordSheet(wb: ExcelJS.Workbook) {
    const headers = [
      ['WILDLIFE SHELTER RECORD SHEET'],
      ['Refer to the Wildlife Code Book and Species Code sheet for code definitions.'],
      [],
      [
        'CASE NUMBER',
        'COMMON NAME',
        'SPECIES CODE',
        'DATE IN',
        'SEX',
        'AGE',
        'INJURY',
        'CAUSE',
        'FOUND (location, incl. GPS/Melways where possible)',
        'DATE OUT',
        'STATUS',
        'NOTES (release location/postcode if released)',
      ],
    ];

    const dataRows = this.data.records.map((r) => {
      const speciesCode = lookupVicSpeciesCode(r.animal.species ?? '') ?? '';
      return [
        r.caseNumber,
        r.animal.species ?? '',
        speciesCode,
        format(r.dateIn, 'dd/MM/yyyy'),
        r.sex,
        r.ageCode,
        r.injuryCode,
        r.causeCode,
        [r.foundLocation, r.foundGpsOrMelways].filter(Boolean).join(' - '),
        r.dateOut ? format(r.dateOut, 'dd/MM/yyyy') : '',
        r.fateCode ?? '',
        r.notes ?? '',
      ];
    });

    const ws = wb.addWorksheet('Wildlife Shelter Record Sheet');
    this.addRowsToSheet(ws, [...headers, ...dataRows]);
    this.setColumnWidths(ws, [14, 24, 12, 12, 6, 6, 8, 8, 34, 12, 8, 34]);

    // Flag any row missing a species code so it can be reconciled against the
    // latest Wildlife Code Book before being shown to an Authorised Officer.
    const missingCodeRows = this.data.records
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => !lookupVicSpeciesCode(r.animal.species ?? ''));
    if (missingCodeRows.length > 0) {
      const warnRow = ws.addRow([]);
      warnRow.getCell(1).value =
        `Note: ${missingCodeRows.length} record(s) above have no matching DEECA species code in this build - ` +
        `verify against the latest Wildlife Code Book (species not yet in vic-species-codes.ts, or genuinely unidentified).`;
    }
  }
}
