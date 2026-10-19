import { NextResponse } from 'next/server';
import { auth } from '@/lib/clerk-server';
import { prisma } from '@/lib/prisma';
import { getUserRole } from '@/lib/rbac';
import { buildFeedAlert, sydneyHour } from '@/lib/feed-alerts';
import { FEED_ALERT_CONFIGS, recipientsFor } from '@/lib/feed-alerts-config';
import { isGmailConfigured, sendGmail } from '@/lib/email/gmail';

export const dynamic = 'force-dynamic';

/**
 * Daily flying-fox feed-volume email.
 *
 * - Vercel cron (Bearer CRON_SECRET) calls at 19:00 and 20:00 UTC; only the
 *   call that lands in the 6am hour in Sydney sends, which handles daylight
 *   saving. Emails go only on days a pup's feed changes.
 * - A signed-in ADMIN can open ?preview=1 to see today's email, or ?send=1
 *   to send it now regardless (for testing). ?json=1 returns the data.
 */
async function buildForConfig(config: (typeof FEED_ALERT_CONFIGS)[number], now: Date) {
  const animals = await prisma.animal.findMany({
    where: {
      clerkOrganizationId: config.clerkOrganizationId,
      status: 'IN_CARE',
      OR: config.species.map((s) => ({ species: { equals: s, mode: 'insensitive' as const } })),
    },
    select: { name: true, orgAnimalId: true, dateOfBirth: true },
    orderBy: { orgAnimalId: 'asc' },
  });
  return { animals, alert: buildFeedAlert(animals, now, config.formula) };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const now = new Date();
  const secret = process.env.CRON_SECRET;
  const isCron = !!secret && request.headers.get('authorization') === `Bearer ${secret}`;

  if (isCron) {
    if (sydneyHour(now) !== 6) return NextResponse.json({ skipped: 'not 6am in Sydney' });
    if (!isGmailConfigured()) return NextResponse.json({ error: 'Gmail not configured' }, { status: 500 });
    const results = [];
    for (const config of FEED_ALERT_CONFIGS) {
      const { animals, alert } = await buildForConfig(config, now);
      if (animals.length === 0 || !alert.anyChanged) {
        results.push({ org: config.clerkOrganizationId, sent: false, reason: animals.length ? 'no change' : 'no pups' });
        continue;
      }
      await sendGmail({ to: recipientsFor(config), subject: alert.subject, text: alert.text, html: alert.html });
      results.push({ org: config.clerkOrganizationId, sent: true, subject: alert.subject });
    }
    return NextResponse.json({ results });
  }

  // Manual use by a signed-in admin of a configured organisation.
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const config = FEED_ALERT_CONFIGS.find((c) => c.clerkOrganizationId === orgId);
  if (!config) return NextResponse.json({ error: 'Feed alerts are not set up for this organisation' }, { status: 404 });
  if ((await getUserRole(userId, orgId)) !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { alert } = await buildForConfig(config, now);
  const recipients = recipientsFor(config);

  if (url.searchParams.get('send') === '1') {
    if (!isGmailConfigured()) {
      return NextResponse.json({ error: 'Gmail not configured: add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel' }, { status: 500 });
    }
    await sendGmail({ to: recipients, subject: `[TEST] ${alert.subject}`, text: alert.text, html: alert.html });
    return NextResponse.json({ sent: true, to: recipients, subject: alert.subject });
  }
  if (url.searchParams.get('json') === '1') {
    return NextResponse.json({ recipients, gmailConfigured: isGmailConfigured(), ...alert });
  }
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><title>Feed email preview</title><body style="margin:24px">
<p style="font:13px Arial;color:#666">Preview only. To: ${recipients.join(', ')}<br>Subject: <b>${alert.subject}</b><br>
Would send at 6am today: <b>${alert.anyChanged ? 'yes' : 'no (no changes)'}</b> · Gmail configured: <b>${isGmailConfigured() ? 'yes' : 'no'}</b></p><hr>${alert.html}</body>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}
