/**
 * Identity of the organisation operating this deployment.
 *
 * WHY THIS IS SEPARATE FROM THE PRODUCT NAME
 * WildTrack360 is the software — a fork of an open-source project under
 * MPL-2.0. Wings and Whiskers Wildlife Shelter Inc is the shelter running it.
 * They are different things and shouldn't be conflated in the interface: the
 * public-facing pages belong to the shelter, while "WildTrack360" stays as the
 * name of the tool.
 *
 * WHY THIS IS NOT AN ENVIRONMENT VARIABLE
 * It could be, but every NEXT_PUBLIC_ variable is another value that silently
 * falls back to something wrong when it isn't set — the failure mode that put
 * localhost into the invitation emails. This is one shelter and one file. Edit
 * it here.
 *
 * NOTE: this is display only. The authorisation number that appears on the
 * DEECA record sheet export is read from OrganisationSettings in the database,
 * not from here, so that the export reflects what is actually stored. The copy
 * below exists so the two can be checked against each other.
 */
export const SITE_BRANDING = {
  /** Registered name of the incorporated association. */
  organisationName: 'Wings and Whiskers Wildlife Shelter Inc',

  /** Short form for headers and other tight spaces. */
  organisationShortName: 'Wings and Whiskers',

  /** Consumer Affairs Victoria incorporated association number. */
  registrationNumber: 'A0121232N',

  /**
   * DEECA Shelter Authorisation number, issued under s28A of the Wildlife Act
   * 1975. Kept here for display and cross-checking only — see the note above.
   */
  authorisationNumber: '15528618',

  /** The software. Do not replace with the shelter name. */
  productName: 'WildTrack360',

  /**
   * Logo shown on the landing page, served from `public/`. To use the
   * shelter's own mark, drop the file into `public/` and change this path.
   * SVG is preferred; a transparent PNG at roughly 800px wide also works.
   */
  logoPath: '/Brandmark-Text-Vert.svg',
} as const;
