import 'server-only';
import { appendSheetRow, readSheetValues, updateSheetRange } from './google-sheets';
import { sanitizeCell } from './sheets-sanitize';
import { parseBookingDateCell, slotKey } from '@/app/konsultasi/booking/lib/availability';

// Mirrors the existing columns of the "Order" tab, plus a trailing
// "Topik Konsultasi" column (M) to capture the consultation topic.
export const ORDER_HEADERS = [
  'ID',
  'Name',
  'Email',
  'Phone',
  'Service',
  'Amount',
  'Payment Status',
  'DOKU Invoice ID',
  'Payment Method',
  'Booking Date',
  'Paid At',
  'Created At',
  'Topik Konsultasi',
] as const;

const TOPIC_COL_INDEX = ORDER_HEADERS.length - 1; // 12 → column M
const STATUS_COL_INDEX = 6; // column G — "Payment Status"
const BOOKING_DATE_COL_INDEX = 9; // column J — "Booking Date"

// Statuses that release a held slot (so it becomes bookable again).
const RELEASED_STATUSES = new Set(['cancelled', 'canceled', 'refunded', 'expired']);

export type NewBooking = {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  topic: string;
  service: string;
  amount: number;
};

/**
 * Date+time slots already taken in the "Order" sheet, as `"YYYY-MM-DD HH:mm"`
 * keys (matching `slotKey`). Any non-released booking holds its slot regardless
 * of payment status. Rows whose Booking Date can't be parsed are skipped.
 */
export async function getBookedSlots(): Promise<Set<string>> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');

  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const rows = await readSheetValues(sheetId, `${tab}!A:M`);

  const taken = new Set<string>();
  for (let i = 1; i < rows.length; i++) {
    // rows[0] is the header.
    const row = rows[i];
    const status = (row[STATUS_COL_INDEX] || '').trim().toLowerCase();
    if (RELEASED_STATUSES.has(status)) continue;
    const parsed = parseBookingDateCell(row[BOOKING_DATE_COL_INDEX] || '');
    if (parsed) taken.add(slotKey(parsed.date, parsed.time));
  }
  return taken;
}

export async function appendBooking(b: NewBooking): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');

  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const range = `${tab}!A:M`;

  const rows = await readSheetValues(sheetId, range);
  if (rows.length === 0) {
    // Empty sheet — lay down the full header row.
    await appendSheetRow(sheetId, range, [...ORDER_HEADERS]);
  } else if (!rows[0][TOPIC_COL_INDEX]) {
    // Existing "Order" sheet without the topic column — label it once.
    await updateSheetRange(sheetId, `${tab}!M1`, [['Topik Konsultasi']]);
  }

  // Booking Date keeps the existing "Order" convention: date + time in one cell.
  const bookingDate = `${b.date} ${b.timeSlot}`;
  const createdAt = new Date().toISOString();

  await appendSheetRow(sheetId, range, [
    b.bookingId,
    sanitizeCell(b.name),
    sanitizeCell(b.email),
    sanitizeCell(b.phone || '-'),
    sanitizeCell(b.service),
    b.amount,
    'pending_payment',
    '',
    '',
    bookingDate,
    '',
    createdAt,
    sanitizeCell(b.topic),
  ]);
}
