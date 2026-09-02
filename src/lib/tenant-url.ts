import 'server-only';

import { clerkClient } from '@clerk/nextjs/server';

// Resolving a tenant's absolute base URL. Each org lives on its own subdomain
// (`<org_url>.<root>`), so a baked-in site-URL env var (NEXT_PUBLIC_APP_URL)
// can't be right for more than one tenant — and isn't even present at runtime
// in the Docker image, which is why it fell back to http://localhost:3000. We
// derive the host from the org's `org_url` publicMetadata (the same slug the
// middleware matches against the request subdomain) and the BAKED
// NEXT_PUBLIC_ROOT_DOMAIN.

type Clerk = Awaited<ReturnType<typeof clerkClient>>;

function rootDomain(): string {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000';
}

/**
 * Returns an explanatory message when NEXT_PUBLIC_ROOT_DOMAIN is missing on a
 * deployed environment, or null when the configuration is usable.
 *
 * WHY THIS EXISTS
 * With the variable unset, every URL this module builds falls back to
 * http://localhost:3000. For a rendered page that is merely wrong. For an
 * invitation it is worse: Clerk emails the link, the recipient's browser tries
 * to reach a server on their own device, and the invite is dead. An email
 * cannot be recalled, so the failure has to happen before it is sent.
 *
 * WHY THIS RETURNS RATHER THAN THROWS, AND IS NOT CALLED AT MODULE LOAD
 * NEXT_PUBLIC_ROOT_DOMAIN is read in roughly a dozen places, including the
 * middleware and the root layout. If this threw on import, an unset variable
 * would take the entire site down rather than disabling one feature. Callers
 * opt in, and only where a bad URL escapes to somebody else.
 */
export function rootDomainConfigError(): string | null {
  if ((process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? '').trim() !== '') return null;

  // NODE_ENV is 'test' under vitest and 'development' under `next dev`, where
  // the localhost fallback is the correct behaviour.
  const deployed =
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.NODE_ENV === 'production';
  if (!deployed) return null;

  return (
    'NEXT_PUBLIC_ROOT_DOMAIN is not set on this deployment, so links would ' +
    'point at localhost and would not work for the recipient. Set it in the ' +
    'hosting environment and redeploy, then try again.'
  );
}

function protocolFor(host: string): 'http' | 'https' {
  return host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
}

// Only the root domain itself or one of its subdomains is a host we'd ever
// redirect to. Anything else in a forwarded header is treated as spoofed.
function isTrustedHost(host: string): boolean {
  const root = rootDomain();
  return host === root || host.endsWith(`.${root}`);
}

// Build a tenant base origin from an already-known org slug. Falls back to the
// bare root domain when the slug is missing/invalid so callers always get an
// absolute, non-localhost URL in prod.
export function tenantBaseUrlFromSlug(orgUrl: string | null | undefined): string {
  const root = rootDomain();
  const proto = protocolFor(root);
  if (orgUrl && /^[a-zA-Z0-9-]+$/.test(orgUrl)) {
    return `${proto}://${orgUrl}.${root}`;
  }
  return `${proto}://${root}`;
}

// Look up an org's tenant base origin (e.g. https://rescue.wildtrack360.com.au).
// Pass an existing Clerk client to avoid a second handshake when the caller
// already has one.
export async function tenantBaseUrl(orgId: string, clerk?: Clerk): Promise<string> {
  const client = clerk ?? (await clerkClient());
  try {
    const org = await client.organizations.getOrganization({ organizationId: orgId });
    const orgUrl = (org.publicMetadata as Record<string, unknown> | null)?.org_url as
      | string
      | undefined;
    return tenantBaseUrlFromSlug(orgUrl);
  } catch {
    return tenantBaseUrlFromSlug(undefined);
  }
}

// Origin (scheme + host) of an inbound request, honoring reverse-proxy headers.
// Used when there's no org context yet (e.g. an OAuth error before the signed
// state is consumed) so we bounce back to the host the caller actually hit
// instead of a baked-in URL.
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);

  // x-forwarded-* are attacker-controllable unless the proxy overwrites them,
  // and this origin feeds a redirect Location — so sanitise before trusting.
  // Take only the first hop, and only accept a host under our root domain;
  // otherwise fall back to the host the server itself received.
  const fwdHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = fwdHost && isTrustedHost(fwdHost) ? fwdHost : url.host;

  const fwdProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  const proto = fwdProto === 'http' || fwdProto === 'https' ? fwdProto : protocolFor(host);

  return `${proto}://${host}`;
}
