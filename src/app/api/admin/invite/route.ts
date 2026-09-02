import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@/lib/clerk-server';
import { getUserRole } from '@/lib/rbac';
import { route } from '@/lib/openapi/route';
import { inviteUserContract } from '../openapi';
import { rootDomainConfigError, tenantBaseUrlFromSlug } from '@/lib/tenant-url';

function clerkErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : null;
}

export const POST = route(inviteUserContract, async ({ body }) => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await getUserRole(userId, orgId);
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { emailAddress } = body;
  if (!emailAddress) return NextResponse.json({ error: 'Email address is required' }, { status: 400 });

  // Checked before the Clerk call: once Clerk sends the email, a bad link
  // cannot be recalled and the recipient just sees a connection error.
  const configError = rootDomainConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 500 });
  }

  try {
    const clerk = await clerkClient();
    const org = await clerk.organizations.getOrganization({ organizationId: orgId });
    const orgUrl = (org.publicMetadata as Record<string, unknown>)?.org_url as string | undefined;

    const redirectUrl = `${tenantBaseUrlFromSlug(orgUrl)}/sign-up`;

    const invitation = await clerk.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress,
      role: 'org:member',
      redirectUrl,
    });

    return { data: { id: invitation.id } };
  } catch (error) {
    console.error('Clerk API error during invitation:', error);
    if (clerkErrorStatus(error) === 403) {
      return NextResponse.json(
        { error: 'Invitation is not permitted for this organisation' },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 502 });
  }
});
