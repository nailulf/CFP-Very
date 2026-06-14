import 'server-only';
import { appendSheetRow, getSheetRowCount } from './google-sheets';
import { sanitizeCell } from './sheets-sanitize';

export const HEADERS = [
  'Timestamp',
  'Booking ID',
  'Nama',
  'Email',
  'No. HP',
  'Tanggal Sesi',
  'Jam Sesi',
  'Topik Konsultasi',
  'Status',
  'Catatan',
] as const;

export type NewBooking = {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  topic: string;
};

export async function appendBooking(b: NewBooking): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');

  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Konsultasi Bookings';
  const range = `${tab}!A:J`;

  const rowCount = await getSheetRowCount(sheetId, range);
  if (rowCount === 0) {
    await appendSheetRow(sheetId, range, [...HEADERS]);
  }

  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  await appendSheetRow(sheetId, range, [
    timestamp,
    b.bookingId,
    sanitizeCell(b.name),
    sanitizeCell(b.email),
    sanitizeCell(b.phone || '-'),
    b.date,
    b.timeSlot,
    sanitizeCell(b.topic),
    'Pending',
    '',
  ]);
}
