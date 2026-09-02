import { describe, expect, it } from 'vitest';
import { SITE_BRANDING } from './site-branding';

/**
 * These values appear on the public landing page and in the browser tab. They
 * are not the source of truth for the DEECA record sheet — that comes from
 * OrganisationSettings — but if the two disagree, one of them is wrong.
 */
describe('SITE_BRANDING', () => {
  it('names the shelter and its registration', () => {
    expect(SITE_BRANDING.organisationName).toBe(
      'Wings and Whiskers Wildlife Shelter Inc'
    );
    expect(SITE_BRANDING.registrationNumber).toBe('A0121232N');
  });

  it('carries the shelter authorisation number', () => {
    expect(SITE_BRANDING.authorisationNumber).toBe('15528618');
  });

  it('keeps the product name distinct from the shelter name', () => {
    // The software is a fork of an MPL-2.0 project. Collapsing the two names
    // would misattribute the software to the shelter.
    expect(SITE_BRANDING.productName).toBe('WildTrack360');
    expect(SITE_BRANDING.productName).not.toBe(SITE_BRANDING.organisationName);
  });

  it('has no blank fields', () => {
    for (const [key, value] of Object.entries(SITE_BRANDING)) {
      expect(value.trim(), `${key} is empty`).not.toBe('');
    }
  });

  it('points the logo at a file served from public/', () => {
    expect(SITE_BRANDING.logoPath.startsWith('/')).toBe(true);
  });
});
