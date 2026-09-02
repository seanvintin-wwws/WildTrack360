/**
 * Wording overrides for Clerk's hosted sign-in and sign-up screens.
 *
 * WHY THIS EXISTS
 * When someone accepts an invitation to the shelter, Clerk shows a card headed
 * "Fill in missing fields" with a box labelled "Enter your password". New
 * carers read that as a password they are supposed to already have, and stop.
 * They aren't signing in - they're choosing a password for the first time.
 *
 * Clerk's own team hit the same complaint and added a sign-up-specific
 * placeholder key ("Create a password") in March 2026. Overriding the title
 * and subtitle as well means the screen reads correctly even if the installed
 * clerk-js predates that key, in which case the unknown key is simply ignored.
 *
 * WHAT IS DELIBERATELY NOT OVERRIDDEN
 * `formFieldInputPlaceholder__password` is shared with the SIGN-IN form, where
 * "Enter your password" is exactly right. Changing it would fix the sign-up
 * screen and break the sign-in one.
 *
 * Keys come from Clerk's English localization file. An unrecognised key fails
 * silently - it does not throw - so if wording stops changing after a Clerk
 * upgrade, check the key names against @clerk/localizations rather than
 * assuming this file is broken.
 */
export const clerkLocalization = {
  signUp: {
    continue: {
      title: 'Create your password',
      subtitle: 'Choose a password to finish setting up your account.',
    },
  },
  // Sign-up-only placeholder. Added in @clerk/clerk-js 5.103+; ignored by
  // older versions, which is why the title and subtitle above carry the
  // message on their own.
  formFieldInputPlaceholder__signUpPassword: 'Create a password',
} as const;
