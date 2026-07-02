import { NextResponse } from 'next/server';
import { bookingExists, setPaymentProof } from '@/lib/konsultasi-store';
import { uploadPaymentProof } from '@/lib/google-drive';
import { OAuthNotConfigured } from '@/lib/google-oauth';

export const runtime = 'nodejs';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const bookingId = String(form.get('bookingId') ?? '').trim();
    const file = form.get('file');

    if (!/^KB-[A-Z0-9]+$/.test(bookingId)) {
      return NextResponse.json({ success: false, message: 'Booking tidak valid.' }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan.' }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Format harus JPG, PNG, atau PDF.' },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: 'Ukuran file maksimal 5 MB.' },
        { status: 400 },
      );
    }

    // Only accept proof for a real booking (prevents folder spam).
    if (!(await bookingExists(bookingId))) {
      return NextResponse.json(
        { success: false, message: 'Booking tidak ditemukan.' },
        { status: 404 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { link } = await uploadPaymentProof({
      bookingId,
      fileName: `bukti.${EXT[file.type] ?? 'dat'}`,
      mimeType: file.type,
      bytes,
    });

    await setPaymentProof(bookingId, link);

    return NextResponse.json({ success: true, link });
  } catch (error) {
    if (error instanceof OAuthNotConfigured) {
      return NextResponse.json(
        { success: false, message: 'Upload bukti pembayaran belum diaktifkan.' },
        { status: 503 },
      );
    }
    console.error('Payment proof upload error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengunggah bukti.' }, { status: 500 });
  }
}
