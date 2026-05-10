import { NextResponse } from 'next/server';
import { INVOICE_COOKIE } from '@/lib/invoice-auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(INVOICE_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
