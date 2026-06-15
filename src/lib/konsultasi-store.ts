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

const ID_COL_INDEX = 0;
const NAME_COL_INDEX = 1;
const EMAIL_COL_INDEX = 2;
const PHONE_COL_INDEX = 3;
const SERVICE_COL_INDEX = 4;
const AMOUNT_COL_INDEX = 5;
const CREATED_AT_COL_INDEX = 11;

export type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  amount: string;
  paymentStatus: string;
  bookingDate: string;
  date: string | null;
  time: string | null;
  topic: string;
  createdAt: string;
};

/** All bookings from the "Order" sheet, newest first. */
export async function listBookings(): Promise<Booking[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');

  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const rows = await readSheetValues(sheetId, `${tab}!A:M`);

  const out: Booking[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[ID_COL_INDEX]) continue;
    const rawDate = row[BOOKING_DATE_COL_INDEX] || '';
    const parsed = parseBookingDateCell(rawDate);
    out.push({
      id: row[ID_COL_INDEX] || '',
      name: row[NAME_COL_INDEX] || '',
      email: row[EMAIL_COL_INDEX] || '',
      phone: row[PHONE_COL_INDEX] || '',
      service: row[SERVICE_COL_INDEX] || '',
      amount: row[AMOUNT_COL_INDEX] || '',
      paymentStatus: (row[STATUS_COL_INDEX] || '').trim(),
      bookingDate: rawDate,
      date: parsed?.date ?? null,
      time: parsed?.time ?? null,
      topic: row[TOPIC_COL_INDEX] || '',
      createdAt: row[CREATED_AT_COL_INDEX] || '',
    });
  }
  return out.reverse();
}

/** Update a booking's Payment Status (column G). Returns false if the id is not found. */
export async function updateBookingStatus(id: string, status: string): Promise<boolean> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');

  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const rows = await readSheetValues(sheetId, `${tab}!A:M`);

  for (let i = 1; i < rows.length; i++) {
    if ((rows[i]?.[ID_COL_INDEX] || '').trim() === id) {
      const sheetRow = i + 1; // header is sheet row 1
      await updateSheetRange(sheetId, `${tab}!G${sheetRow}`, [[status]]);
      return true;
    }
  }
  return false;
}
