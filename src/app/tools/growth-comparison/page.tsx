import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/clerk-server';
import { prisma } from '@/lib/prisma';
import { getAuthorisedSpecies, getUserRole } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import type { ComparisonAnimal, ReferenceRow } from '@/lib/growth-comparison';
import GrowthComparisonClient from './growth-comparison-client';

export const metadata = {
  title: 'Growth Comparison - WildTrack360',
};

export const dynamic = 'force-dynamic';

/** Same visibility rules as the animal list: carers see their own animals only. */
async function visibleAnimalFilter(
  userId: string,
  orgId: string
): Promise<Prisma.AnimalWhereInput> {
  const role = await getUserRole(userId, orgId);
  if (role === 'ADMIN' || role === 'COORDINATOR_ALL' || role === 'CARER_ALL') {
    return { clerkOrganizationId: orgId };
  }
  if (role === 'COORDINATOR') {
    const species = await getAuthorisedSpecies(userId, orgId);
    return {
      clerkOrganizationId: orgId,
      OR: [
        ...(species && species.length > 0 ? [{ species: { in: species } }] : []),
        { carerId: userId },
      ],
    };
  }
  return { clerkOrganizationId: orgId, carerId: userId };
}

export default async function GrowthComparisonPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/landing');

  const where = await visibleAnimalFilter(userId, orgId);

  const animals = await prisma.animal.findMany({
    where: { ...where, growthMeasurements: { some: {} } },
    select: {
      id: true,
      name: true,
      orgAnimalId: true,
      sex: true,
      species: true,
      status: true,
      dateOfBirth: true,
      growthMeasurements: {
        where: { clerkOrganizationId: orgId },
        select: { date: true, weightGrams: true, armLengthMm: true },
        orderBy: { date: 'asc' },
      },
    },
    orderBy: { orgAnimalId: 'asc' },
  });

  const referenceSpecies = await prisma.speciesGrowthReference.findMany({
    distinct: ['speciesName'],
    select: { speciesName: true },
  });
  const refNameFor = (species: string) =>
    referenceSpecies.find((r) => r.speciesName.toLowerCase() === species.toLowerCase())
      ?.speciesName ?? null;

  const bySpecies: Record<string, ComparisonAnimal[]> = {};
  for (const a of animals) {
    const refName = refNameFor(a.species);
    if (!refName) continue;
    (bySpecies[refName] ??= []).push({
      id: a.id,
      name: a.name,
      orgAnimalId: a.orgAnimalId,
      sex: a.sex,
      status: a.status,
      dateOfBirth: a.dateOfBirth ? a.dateOfBirth.toISOString() : null,
      measurements: a.growthMeasurements.map((m) => ({
        date: m.date.toISOString(),
        weightGrams: m.weightGrams,
        armLengthMm: m.armLengthMm,
      })),
    });
  }

  const speciesNames = Object.keys(bySpecies).sort();
  const referenceRows = speciesNames.length
    ? await prisma.speciesGrowthReference.findMany({
        where: { speciesName: { in: speciesNames } },
        orderBy: [{ speciesName: 'asc' }, { sex: 'asc' }, { ageDays: 'asc' }],
      })
    : [];

  const references: Record<string, ReferenceRow[]> = {};
  for (const r of referenceRows) {
    (references[r.speciesName] ??= []).push({
      sex: r.sex,
      ageDays: r.ageDays,
      weightGrams: r.weightGrams,
      headLengthMm: r.headLengthMm,
      earLengthMm: r.earLengthMm,
      armLengthMm: r.armLengthMm,
      legLengthMm: r.legLengthMm,
      footLengthMm: r.footLengthMm,
      tailLengthMm: r.tailLengthMm,
      bodyLengthMm: r.bodyLengthMm,
      wingLengthMm: r.wingLengthMm,
      reference: r.reference,
    });
  }

  // Default to the species with the most animals currently in care.
  const inCareCount = (s: string) =>
    bySpecies[s].filter((a) => a.status === 'IN_CARE').length;
  const defaultSpecies =
    [...speciesNames].sort((a, b) => inCareCount(b) - inCareCount(a))[0] ?? null;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tools">
          <Button variant="outline" size="icon" className="shrink-0" aria-label="Back to tools">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="icon" className="shrink-0" aria-label="Home">
            <Home className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Growth Comparison</h1>
          <p className="text-sm text-muted-foreground">
            Compare animals of one species against each other and the expected growth curve.
          </p>
        </div>
      </div>
      <GrowthComparisonClient
        animalsBySpecies={bySpecies}
        references={references}
        defaultSpecies={defaultSpecies}
        today={new Date().toISOString()}
      />
    </div>
  );
}
