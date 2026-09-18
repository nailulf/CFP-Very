// src/lib/mailer.ts
import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Outbound transactional mail over Gmail SMTP, using the app password already
 * provisioned as GMAIL_USER / GMAIL_APP_PASSWORD.
 *
 * Every send is best-effort — exactly like createBookingEvent and the Mayar
 * invoice call — so a mail outage can never fail a booking or a webhook. The
 * caller gets a boolean and decides what to do with it.
 */

export type MailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const FROM_NAME = process.env.MAIL_FROM_NAME || 'Teman Tumbuh';

let cached: Transporter | null = null;

export function isMailerConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function transporter(): Transporter {
  // Gmail closes idle SMTP connections, but nodemailer's pool reconnects on
  // demand; reusing one transporter avoids a TLS handshake per send on a warm
  // serverless instance.
  if (cached) return cached;
  cached = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return cached;
}

/**
 * Send one transactional email. Returns false (never throws) when the mailer
 * isn't configured or SMTP rejects the message.
 */
export async function sendMail(input: MailInput): Promise<boolean> {
  if (!isMailerConfigured()) return false;
  if (!input.to) return false;

  try {
    await transporter().sendMail({
      from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return true;
  } catch (error) {
    console.error(`sendMail failed for "${input.subject}":`, error);
    return false;
  }
}
