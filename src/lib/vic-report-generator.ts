import { Animal } from '@prisma/client';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { lookupVicSpeciesCode } from './vic-species-codes';
import {
  VIC_AGE_CODES,
  VIC_CAUSE_CODES,
  VIC_FATE_CODES,
  VIC_INJURY_CODES,
  lookupVicCauseLabel,
  lookupVicFateLabel,
  lookupVicInjuryLabel,
} from './vic-picklists';

/** Thin border used throughout the record sheet and reference tables. */
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFB0B0B0' } },
  left: { style: 'thin', color: { argb: 'FFB0B0B0' } },
  bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } },
  right: { style: 'thin', color: { argb: 'FFB0B0B0' } },
};

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1F3D2B' },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
};

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
    /** Legal name of the authorisation holder (OrganisationSettings.legalName). */
    name?: string | null;
    /**
     * DEECA shelter authorisation number (OrganisationSettings.licenseNumber).
     * Stored in the shared licenceNumber field so the ACT and NSW exports can
     * use the same column for their equivalent identifiers.
     */
    authorisationNumber?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
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
    this.addCodeReferenceSheet(wb);
    return wb;
  }

  /**
   * Renders a cover-sheet value, or a visible placeholder when it is missing.
   *
   * These fields identify the shelter on a document that is produced to a
   * Conservation Regulator Authorised Officer on request. A blank line reads
   * as an oversight and gives the shelter no clue that anything is wrong; an
   * explicit NOT SET marker says what is missing and where to fix it. Do not
   * replace this with a plausible-looking default — a wrong authorisation
   * holder is worse than an obviously absent one.
   */
  private static coverValue(
    value: string | null | undefined,
    whatToSet: string
  ): string {
    const trimmed = (value ?? '').trim();
    return trimmed !== ''
      ? trimmed
      : `[NOT SET - add ${whatToSet} in organisation settings]`;
  }

  private contactLine(): string {
    const { contactName, contactEmail, contactPhone } = this.data.organization;
    const parts = [contactName, contactEmail, contactPhone]
      .map((part) => (part ?? '').trim())
      .filter((part) => part !== '');

    return parts.length > 0
      ? parts.join(', ')
      : '[NOT SET - add contact details in organisation settings]';
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
      [
        `Authorisation holder: ${VicReportGenerator.coverValue(
          this.data.organization.name,
          'the legal name'
        )}`,
      ],
      [
        `Authorisation number: ${VicReportGenerator.coverValue(
          this.data.organization.authorisationNumber,
          'the authorisation number'
        )}`,
      ],
      [`Contact: ${this.contactLine()}`],
      [`Export generated: ${format(new Date(), 'dd/MM/yyyy')}`],
    ];
    const ws = wb.addWorksheet('Cover');
    this.addRowsToSheet(ws, sheetData);
    this.setColumnWidths(ws, [110]);
  }

  /**
   * Column headers exactly as DEECA names them in "How to complete your
   * record sheet" (see file header for the source URL) - CASE NUMBER,
   * COMMON NAME, etc. Kept bare (no parenthetical hints appended) so the
   * printed sheet reads the same as the paper/official version; guidance
   * that used to be jammed into the header text now lives in cell comments
   * on the header cells and in the Code Reference sheet instead.
   */
  private static readonly RECORD_SHEET_HEADERS = [
    'CASE NUMBER',
    'COMMON NAME',
    'SPECIES CODE',
    'DATE IN',
    'SEX',
    'AGE',
    'INJURY',
    'CAUSE',
    'FOUND',
    'DATE OUT',
    'STATUS',
    'NOTES',
  ] as const;

  private static readonly RECORD_SHEET_COLUMN_WIDTHS = [
    14, 26, 12, 12, 6, 6, 8, 8, 34, 12, 8, 34,
  ];

  /** Per-header-cell guidance, taken verbatim from DEECA's own field guide. */
  private static readonly RECORD_SHEET_HEADER_NOTES: Record<string, string> = {
    'CASE NUMBER':
      'Enter consecutive numbers to give each admission an identifying case number, e.g. 16/001.',
    'COMMON NAME':
      "Use the accepted common name from the Wildlife Code Book. If unsure of the exact species, use 'sp.' (e.g. small bat sp.) and leave Species Code blank.",
    'SPECIES CODE': 'Enter the species code from the Wildlife Code Book, e.g. 142.',
    'DATE IN': 'Date the animal was admitted to the shelter.',
    SEX: 'M = Male, F = Female, U = sex could not be determined.',
    AGE: 'Single-letter age class code (differs for birds/mammals/reptiles - see Code Reference sheet). If the animal has young, record the age of the parent.',
    INJURY:
      'Single-letter code for the most serious injury present, if more than one (see Code Reference sheet).',
    CAUSE: 'Two-digit code for the cause of injury (see Code Reference sheet).',
    FOUND: 'Location found, including GPS coordinates or a Melways reference where possible, so the animal can be released where it was found.',
    'DATE OUT': 'Date released from the shelter, or date of death.',
    STATUS: 'Two-digit fate code - died, transferred, or released (see Code Reference sheet).',
    NOTES: 'For released animals, record the release location and postcode here.',
  };

  private styleHeaderRow(row: ExcelJS.Row, notes?: Record<string, string>) {
    row.eachCell((cell, colNumber) => {
      cell.font = HEADER_FONT;
      cell.fill = HEADER_FILL;
      cell.border = THIN_BORDER;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      const headerText = typeof cell.value === 'string' ? cell.value : undefined;
      const note = headerText && notes ? notes[headerText] : undefined;
      if (note) {
        cell.note = note;
      }
      void colNumber;
    });
  }

  private addWildlifeShelterRecordSheet(wb: ExcelJS.Workbook) {
    const ws = wb.addWorksheet('Wildlife Shelter Record Sheet', {
      pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      views: [{ state: 'frozen', ySplit: 6 }],
    });

    ws.mergeCells('A1:L1');
    ws.getCell('A1').value = 'WILDLIFE SHELTER RECORD SHEET';
    ws.getCell('A1').font = { bold: true, size: 14 };
    ws.getCell('A1').alignment = { horizontal: 'center' };

    ws.mergeCells('A2:F2');
    ws.getCell('A2').value = `Authorisation holder: ${VicReportGenerator.coverValue(
      this.data.organization.name,
      'the legal name'
    )}`;
    ws.mergeCells('G2:L2');
    ws.getCell('G2').value = `Authorisation number: ${VicReportGenerator.coverValue(
      this.data.organization.authorisationNumber,
      'the authorisation number'
    )}`;

    ws.mergeCells('A3:L3');
    ws.getCell('A3').value =
      `Records covering: ${format(this.data.reportingPeriod.startDate, 'dd/MM/yyyy')} to ${format(this.data.reportingPeriod.endDate, 'dd/MM/yyyy')}`;

    ws.mergeCells('A4:L4');
    ws.getCell('A4').value =
      'Refer to the Code Reference sheet (this workbook) and the Wildlife Code Book for full code definitions.';
    ws.getCell('A4').font = { italic: true, size: 9, color: { argb: 'FF555555' } };

    ws.addRow([]);

    const headerRow = ws.addRow([...VicReportGenerator.RECORD_SHEET_HEADERS]);
    this.styleHeaderRow(headerRow, VicReportGenerator.RECORD_SHEET_HEADER_NOTES);

    for (const r of this.data.records) {
      const speciesCode = lookupVicSpeciesCode(r.animal.species ?? '') ?? '';
      const row = ws.addRow([
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
      ]);
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = THIN_BORDER;
      });

      // Resolved code labels go on as cell comments (hover tooltips) rather
      // than in the cell text itself, so the printed/exported value stays
      // the bare code DEECA asks for while still being readable on screen.
      const ageLabel = VIC_AGE_CODES.bird
        .concat(VIC_AGE_CODES.mammal, VIC_AGE_CODES['reptile-amphibian'])
        .find((c) => c.code === r.ageCode)?.label;
      if (ageLabel) row.getCell(6).note = ageLabel;
      const injuryLabel = lookupVicInjuryLabel(r.injuryCode);
      if (injuryLabel) row.getCell(7).note = injuryLabel;
      const causeLabel = lookupVicCauseLabel(r.causeCode);
      if (causeLabel) row.getCell(8).note = causeLabel;
      if (r.fateCode) {
        const fateLabel = lookupVicFateLabel(r.fateCode);
        if (fateLabel) row.getCell(11).note = fateLabel;
      }
    }

    ws.columns.forEach((col, i) => {
      col.width = VicReportGenerator.RECORD_SHEET_COLUMN_WIDTHS[i];
    });

    // Flag any row missing a species code so it can be reconciled against the
    // latest Wildlife Code Book before being shown to an Authorised Officer.
    const missingCodeRows = this.data.records
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => !lookupVicSpeciesCode(r.animal.species ?? ''));
    if (missingCodeRows.length > 0) {
      ws.addRow([]);
      const warnRow = ws.addRow([]);
      warnRow.getCell(1).value =
        `Note: ${missingCodeRows.length} record(s) above have no matching DEECA species code in this build - ` +
        `verify against the latest Wildlife Code Book (species not yet in vic-species-codes.ts, or genuinely unidentified).`;
      warnRow.getCell(1).font = { italic: true, color: { argb: 'FF9A6700' } };
    }
  }

  /**
   * A self-contained code reference: age/injury/cause/fate tables sourced
   * from vic-picklists.ts (itself transcribed from DEECA's "Species Code"
   * document). The paper/original template points shelters at a separate
   * Wildlife Code Book document for this; bundling it into the workbook
   * means an Authorised Officer reviewing the export doesn't need a second
   * document open to read the codes on the sheet.
   */
  private addCodeReferenceSheet(wb: ExcelJS.Workbook) {
    const ws = wb.addWorksheet('Code Reference');
    ws.getColumn(1).width = 10;
    ws.getColumn(2).width = 55;
    ws.getColumn(3).width = 40;

    const addSection = (title: string, rows: { code: string; label: string; description?: string }[]) => {
      const titleRow = ws.addRow([title]);
      titleRow.getCell(1).font = { bold: true, size: 12 };
      ws.mergeCells(titleRow.number, 1, titleRow.number, 3);

      const headerRow = ws.addRow(['Code', 'Label', 'Description']);
      this.styleHeaderRow(headerRow);

      for (const r of rows) {
        const row = ws.addRow([r.code, r.label, r.description ?? '']);
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = THIN_BORDER;
        });
      }
      ws.addRow([]);
    };

    addSection(
      'AGE - Birds',
      VIC_AGE_CODES.bird.map((c) => ({ code: c.code, label: c.label, description: c.description }))
    );
    addSection(
      'AGE - Mammals',
      VIC_AGE_CODES.mammal.map((c) => ({ code: c.code, label: c.label, description: c.description }))
    );
    addSection(
      'AGE - Reptiles & Amphibians',
      VIC_AGE_CODES['reptile-amphibian'].map((c) => ({
        code: c.code,
        label: c.label,
        description: c.description,
      }))
    );
    addSection('INJURY', VIC_INJURY_CODES);
    addSection('CAUSE', VIC_CAUSE_CODES);
    addSection('STATUS (fate)', VIC_FATE_CODES);

    const note = ws.addRow([
      'Species codes are not reproduced here as there are 700+ entries - see the Wildlife Code Book, or the Species Code column note on each row of the record sheet.',
    ]);
    note.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF555555' } };
    ws.mergeCells(note.number, 1, note.number, 3);
  }
}
