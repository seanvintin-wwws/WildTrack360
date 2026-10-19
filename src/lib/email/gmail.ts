import 'server-only';
import nodemailer from 'nodemailer';

/**
 * Send through a Gmail account with an app password.
 * Needs GMAIL_USER (e.g. seanvintin@gmail.com) and GMAIL_APP_PASSWORD in Vercel.
 */
export function isGmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.trim());
}

export async function sendGmail(input: { to: string[]; subject: string; text: string; html: string }) {
  if (!isGmailConfigured()) throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD are not configured');
  const user = process.env.GMAIL_USER!.trim();
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, '') },
  });
  return transport.sendMail({
    from: `WildTrack360 Feeds <${user}>`,
    to: input.to.join(', '),
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}
