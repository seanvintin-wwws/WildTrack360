import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { rootDomainConfigError, tenantBaseUrlFromSlug } from './tenant-url';

/**
 * Regression tests for the invitation link that pointed at localhost:3000.
 *
 * NEXT_PUBLIC_ROOT_DOMAIN was unset on the deployment, so every URL this
 * module builds silently fell back to the developer default. The invite email
 * went out with http://localhost:3000/sign-up in it and the recipient got a
 * connection error on their phone.
 */

// NODE_ENV is deliberately not saved/restored: TypeScript types it read-only,
// and these tests never assign to it. Under vitest it is 'test', which the
// guard correctly treats as not-deployed.
const ENV_KEYS = ['NEXT_PUBLIC_ROOT_DOMAIN', 'VERCEL_ENV'] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) saved[key] = process.env[key];
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

describe('rootDomainConfigError', () => {
  it('reports a problem when the domain is unset on a production deploy', () => {
    delete process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    process.env.VERCEL_ENV = 'production';

    const error = rootDomainConfigError();
    expect(error).not.toBeNull();
    expect(error).toContain('NEXT_PUBLIC_ROOT_DOMAIN');
    // The message is shown to an admin in the invite dialog, so it has to say
    // what went wrong and what to do, not just name the variable.
    expect(error).toContain('localhost');
    expect(error).toContain('redeploy');
  });

  it('reports a problem on preview deploys too', () => {
    delete process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    process.env.VERCEL_ENV = 'preview';
    expect(rootDomainConfigError()).not.toBeNull();
  });

  it('treats an empty or whitespace value as unset', () => {
    process.env.VERCEL_ENV = 'production';

    process.env.NEXT_PUBLIC_ROOT_DOMAIN = '';
    expect(rootDomainConfigError()).not.toBeNull();

    process.env.NEXT_PUBLIC_ROOT_DOMAIN = '   ';
    expect(rootDomainConfigError()).not.toBeNull();
  });

  it('is satisfied once the domain is configured', () => {
    process.env.VERCEL_ENV = 'production';
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'wild-track360.vercel.app';
    expect(rootDomainConfigError()).toBeNull();
  });

  it('stays quiet in local development, where localhost is correct', () => {
    delete process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    delete process.env.VERCEL_ENV;
    expect(rootDomainConfigError()).toBeNull();
  });
});

describe('tenantBaseUrlFromSlug', () => {
  it('builds an https URL on the configured domain', () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'wild-track360.vercel.app';
    expect(tenantBaseUrlFromSlug(undefined)).toBe(
      'https://wild-track360.vercel.app'
    );
  });

  it('prefixes a valid org slug as a subdomain', () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'wildtrack360.com.au';
    expect(tenantBaseUrlFromSlug('rescue')).toBe(
      'https://rescue.wildtrack360.com.au'
    );
  });

  it('ignores a slug that is not a plain hostname label', () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'wildtrack360.com.au';
    expect(tenantBaseUrlFromSlug('evil.example.com')).toBe(
      'https://wildtrack360.com.au'
    );
    expect(tenantBaseUrlFromSlug('has space')).toBe(
      'https://wildtrack360.com.au'
    );
  });

  it('uses http only for localhost', () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'localhost:3000';
    expect(tenantBaseUrlFromSlug(undefined)).toBe('http://localhost:3000');
  });
});
