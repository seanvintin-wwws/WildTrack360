import { describe, expect, it } from 'vitest';
import { clerkLocalization } from './clerk-localization';

/**
 * The invitation screen said "Fill in missing fields" / "Enter your password",
 * which reads as a password the invitee should already have. They don't - they
 * are choosing one for the first time.
 */
describe('clerkLocalization', () => {
  it('reframes the invitation step as creating a password', () => {
    expect(clerkLocalization.signUp.continue.title).toBe('Create your password');
    expect(clerkLocalization.signUp.continue.subtitle.toLowerCase()).toContain(
      'choose a password'
    );
  });

  it('uses the sign-up-only placeholder key', () => {
    expect(clerkLocalization.formFieldInputPlaceholder__signUpPassword).toBe(
      'Create a password'
    );
  });

  it('does not override the shared password placeholder', () => {
    // That key is used by the SIGN-IN form too, where "Enter your password" is
    // correct. Overriding it would fix one screen and break the other.
    expect(clerkLocalization).not.toHaveProperty(
      'formFieldInputPlaceholder__password'
    );
  });

  it('never tells the user they already have a password', () => {
    const wording = JSON.stringify(clerkLocalization).toLowerCase();
    expect(wording).not.toContain('enter your password');
    expect(wording).not.toContain('missing fields');
  });
});
