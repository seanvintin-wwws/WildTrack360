'server-only';

import { prisma } from "@/lib/prisma";
import { renderAnimalIdTemplate, type TemplateContext } from "./template";
import { allocateNextSequenceValue } from "./sequence";
import { highestSequenceUsed, reconciledNextValue } from "./highest-used";
import type { Prisma, PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

async function getOrgSettings(orgId: string) {
  return prisma.organisationSettings.findUnique({
    where: { clerkOrganisationId: orgId },
  });
}

function yearFromDate(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date passed to yearFromDate: ${String(date)}`);
  }
  return d.getFullYear();
}

/**
 * Preview an animal ID without incrementing the sequence.
 * Returns the rendered template using the current nextValue (or 1 if no row exists).
 */
export async function peekAnimalId(
  orgId: string,
  intakeDate: Date | string,
  species?: string
): Promise<string> {
  const settings = await getOrgSettings(orgId);
  const template = settings?.animalIdTemplate ?? "{ORG_SHORT}-{YYYY}-{seq:4}";
  const orgShortCode = settings?.orgShortCode ?? "ORG";
  const year = yearFromDate(intakeDate);

  const seqRow = await prisma.animalIdSequence.findUnique({
    where: { clerkOrganisationId_year: { clerkOrganisationId: orgId, year } },
  });

  // Preview must agree with what commitAnimalId will actually assign, which
  // reconciles the counter against IDs already in use. Read-only here: showing
  // a number the save then contradicts invites a manual override that would
  // itself collide. See ./highest-used.ts.
  const previewExisting = await prisma.animal.findMany({
    where: { clerkOrganizationId: orgId, orgAnimalId: { not: null } },
    select: { orgAnimalId: true },
  });
  const previewSeq = reconciledNextValue(
    seqRow?.nextValue ?? 1,
    highestSequenceUsed(previewExisting.map((a: { orgAnimalId: string | null }) => a.orgAnimalId))
  );

  const ctx: TemplateContext = {
    orgShortCode,
    year,
    seq: previewSeq,
    species,
  };

  return renderAnimalIdTemplate(template, ctx);
}

/**
 * Atomically claim the next sequence number and return the rendered animal ID.
 * Must be called inside a Prisma interactive transaction.
 */
export async function commitAnimalId(
  tx: TransactionClient,
  orgId: string,
  intakeDate: Date | string,
  species?: string
): Promise<string> {
  const settings = await tx.organisationSettings.findUnique({
    where: { clerkOrganisationId: orgId },
  });
  const template = settings?.animalIdTemplate ?? "{ORG_SHORT}-{YYYY}-{seq:4}";
  const orgShortCode = settings?.orgShortCode ?? "ORG";
  const year = yearFromDate(intakeDate);

  // Reconcile the counter with IDs already in use before claiming. Manual
  // renumbering (e.g. aligning with the DEECA intake spreadsheet) leaves the
  // counter behind, and the next animal would otherwise collide with an ID
  // already on the record sheet. See ./highest-used.ts.
  const existing = await tx.animal.findMany({
    where: { clerkOrganizationId: orgId, orgAnimalId: { not: null } },
    select: { orgAnimalId: true },
  });
  const highestUsed = highestSequenceUsed(existing.map((a: { orgAnimalId: string | null }) => a.orgAnimalId));
  const seqRow = await tx.animalIdSequence.findUnique({
    where: { clerkOrganisationId_year: { clerkOrganisationId: orgId, year } },
  });
  const reconciled = reconciledNextValue(seqRow?.nextValue ?? 1, highestUsed);
  if (seqRow && reconciled !== seqRow.nextValue) {
    await tx.animalIdSequence.update({
      where: { clerkOrganisationId_year: { clerkOrganisationId: orgId, year } },
      data: { nextValue: reconciled },
    });
  } else if (!seqRow && reconciled > 1) {
    await tx.animalIdSequence.create({
      data: { clerkOrganisationId: orgId, year, nextValue: reconciled },
    });
  }

  const claimedValue = await allocateNextSequenceValue(tx, orgId, year);

  const ctx: TemplateContext = {
    orgShortCode,
    year,
    seq: claimedValue,
    species,
  };

  return renderAnimalIdTemplate(template, ctx);
}
