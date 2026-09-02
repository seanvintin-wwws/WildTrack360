import { NextResponse } from 'next/server'
import { auth } from '@/lib/clerk-server'
import { prisma } from '@/lib/prisma'
import { getUserRole, hasPermission } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'
import { VicReportGenerator } from '@/lib/vic-report-generator'

/**
 * One-button DEECA Wildlife Shelter Record Sheet export.
 *
 * WHAT THIS DELIBERATELY LEAVES OUT
 * An Authorised Officer inspecting under Condition 23 is entitled to the
 * wildlife record: what came in, what happened to it, where it went. They are
 * not asking for the animal's clinical history, and including it would hand
 * over more than is required while burying the twelve columns they actually
 * want to read.
 *
 * So this export is restricted to the columns on DEECA's own record sheet.
 * Medications, treatments, subcutaneous fluids, vet notes, weights, growth
 * measurements, carer rosters, feed logs and photographs are all excluded.
 * They stay in the system and remain available to a vet, they are simply not
 * part of this document.
 *
 * The one clinical detail that IS included is the injury and cause codes,
 * because DEECA's record sheet asks for them by name.
 */

export const GET = async (request: Request) => {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = await getUserRole(userId, orgId)
  if (!hasPermission(role, 'compliance:export_registers')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(request.url)
  const startDateRaw = url.searchParams.get('startDate')
  const endDateRaw = url.searchParams.get('endDate')

  // Default to the three-year retention window, since that is the period an
  // Authorised Officer can ask to see (Condition 23).
  const endDate = endDateRaw ? new Date(endDateRaw) : new Date()
  const startDate = startDateRaw
    ? new Date(startDateRaw)
    : new Date(new Date().setFullYear(endDate.getFullYear() - 3))

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
  }

  try {
    const organization = await prisma.organisationSettings
      .findFirst({ where: { clerkOrganisationId: orgId } })
      .catch(() => null)

    const animals = await prisma.animal.findMany({
      where: {
        clerkOrganizationId: orgId,
        OR: [
          { dateFound: { gte: startDate, lte: endDate } },
          { dateAdmitted: { gte: startDate, lte: endDate } },
        ],
      },
      orderBy: [{ dateAdmitted: 'asc' }, { dateFound: 'asc' }],
    })

    const generator = new VicReportGenerator({
      reportingPeriod: { startDate, endDate },
      // These map onto OrganisationSettings as it actually exists. The previous
      // version read `organizationName` and `authorisationNumber`, neither of
      // which are columns on that model, through an `as` cast that suppressed
      // the type error — so both always resolved to undefined and the cover
      // sheet went out blank. If you add fields here, check schema.prisma
      // first and do not reintroduce a cast.
      organization: {
        name: organization?.legalName,
        authorisationNumber: organization?.licenseNumber,
        contactEmail: organization?.contactEmail,
        contactPhone: organization?.contactPhone,
      },
      records: VicReportGenerator.rowsFromAnimals(animals),
    })

    const workbook = generator.generateReport()
    const buffer = await workbook.xlsx.writeBuffer()

    const stamp = new Date().toISOString().split('T')[0]

    logAudit({
      userId,
      orgId,
      action: 'EXPORT',
      entity: 'WildlifeShelterRecordSheet',
      entityId: orgId,
      metadata: {
        recordCount: animals.length,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    })

    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="wildlife-shelter-record-sheet-${stamp}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('DEECA record sheet export failed', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
