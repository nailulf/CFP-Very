import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  INVOICE_COOKIE,
  INVOICE_COOKIE_OPTIONS,
  createSessionToken,
  validateCredentials,
} from '@/lib/invoice-auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    if (!validateCredentials(email, password)) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const token = createSessionToken(email);
    const response = NextResponse.json({ success: true });
    response.cookies.set(INVOICE_COOKIE, token, INVOICE_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error('Invoice login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
