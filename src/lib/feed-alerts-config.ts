import type { AlertFormula } from './feed-alerts';

/**
 * Who gets the daily flying-fox feed email, per organisation.
 * Wings and Whiskers Wildlife Shelter Inc (Clerk org below).
 * Override recipients without a code change via FEED_ALERT_RECIPIENTS
 * (comma-separated) in Vercel.
 */
export interface FeedAlertConfig {
  clerkOrganizationId: string;
  recipients: string[];
  formula: AlertFormula;
  /** Species (case-insensitive) the Pinson chart applies to. */
  species: string[];
}

export const FEED_ALERT_CONFIGS: FeedAlertConfig[] = [
  {
    clerkOrganizationId: 'org_3IdDKEYqHvK1KQYJVkVn2tZWS7H',
    recipients: ['seanvintin@gmail.com', 'eris.fink@gmail.com'],
    formula: 'goats-milk',
    species: ['grey-headed flying fox', 'grey-headed flying-fox'],
  },
];

export function recipientsFor(config: FeedAlertConfig): string[] {
  const env = process.env.FEED_ALERT_RECIPIENTS?.split(',').map((s) => s.trim()).filter(Boolean);
  return env && env.length > 0 ? env : config.recipients;
}
