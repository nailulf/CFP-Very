import crypto from 'crypto';
import { cookies } from 'next/headers';

export const INVOICE_COOKIE = 'invoice_session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const secret = process.env.INVOICE_AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('INVOICE_AUTH_SECRET is not configured (min 16 chars).');
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createSessionToken(email: string): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + COOKIE_MAX_AGE * 1000;
  const payload = `${email}|${issuedAt}|${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}|${signature}`, 'utf-8').toString('base64url');
}

export function verifySessionToken(token: string): { email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split('|');
    if (parts.length !== 4) return null;
    const [email, issuedAt, expiresAt, signature] = parts;
    const expected = sign(`${email}|${issuedAt}|${expiresAt}`);
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    if (Date.now() > Number(expiresAt)) return null;
    return { email };
  } catch {
    return null;
  }
}

export function validateCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.INVOICE_AUTH_EMAIL || '';
  const expectedPassword = process.env.INVOICE_AUTH_PASSWORD || '';
  if (!expectedEmail || !expectedPassword) return false;

  const e1 = Buffer.from(email);
  const e2 = Buffer.from(expectedEmail);
  const p1 = Buffer.from(password);
  const p2 = Buffer.from(expectedPassword);

  const emailMatch =
    e1.length === e2.length && crypto.timingSafeEqual(e1, e2);
  const passwordMatch =
    p1.length === p2.length && crypto.timingSafeEqual(p1, p2);

  return emailMatch && passwordMatch;
}

export async function getInvoiceSession(): Promise<{ email: string } | null> {
  const store = await cookies();
  const token = store.get(INVOICE_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const INVOICE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: COOKIE_MAX_AGE,
};
