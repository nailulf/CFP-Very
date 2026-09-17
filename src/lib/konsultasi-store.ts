import 'server-only';
import { appendSheetRow, readSheetValues, updateSheetRange } from './google-sheets';
import { sanitizeCell } from './sheets-sanitize';
import { parseBookingDateCell, slotKey } from '@/app/konsultasi/booking/lib/availability';
import { isPaymentExpired } from './konsultasi-payment-window';

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
    if (!parsed) continue;
    // Unpaid bookings only hold their slot while the 1-hour payment window is open.
    if (
      status === 'pending_payment' &&
      isPaymentExpired(row[CREATED_AT_COL_INDEX] || '', parsed.date, parsed.time, new Date())
    ) {
      continue;
    }
    taken.add(slotKey(parsed.date, parsed.time));
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
  paymentLink: string;
};

/** All bookings from the "Order" sheet, newest first. */
export async function listBookings(): Promise<Booking[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');

  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const rows = await readSheetValues(sheetId, `${tab}!A:P`);

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
      paymentLink: (row[PAYMENT_LINK_COL_INDEX] || '').trim(),
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

const PROOF_COL_INDEX = 13; // column N — "Bukti Pembayaran"
const INVOICE_COL_INDEX = 7; // column H — "DOKU Invoice ID" (now: Mayar invoice ID)
const METHOD_COL_INDEX = 8; // column I — "Payment Method"
const PAID_AT_COL_INDEX = 10; // column K — "Paid At"
const MEET_LINK_COL_INDEX = 14; // column O — "Meet Link" (additive, labelled lazily)
const PAYMENT_LINK_COL_INDEX = 15; // column P — "Payment Link" (additive, labelled lazily)

/** True if a booking id exists in the "Order" sheet. */
export async function bookingExists(id: string): Promise<boolean> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');
  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const rows = await readSheetValues(sheetId, `${tab}!A:A`);
  return rows.some((r, i) => i > 0 && (r[0] || '').trim() === id);
}

/**
 * Record an uploaded payment-proof link (column N) and flag the booking as
 * awaiting verification (column G). Returns false if the id is not found.
 */
export async function setPaymentProof(
  id: string,
  link: string,
  status = 'menunggu_verifikasi',
): Promise<boolean> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');

  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const rows = await readSheetValues(sheetId, `${tab}!A:N`);
  if (rows.length > 0 && !rows[0][PROOF_COL_INDEX]) {
    await updateSheetRange(sheetId, `${tab}!N1`, [['Bukti Pembayaran']]);
  }

  for (let i = 1; i < rows.length; i++) {
    if ((rows[i]?.[ID_COL_INDEX] || '').trim() === id) {
      const sheetRow = i + 1; // header is sheet row 1
      await updateSheetRange(sheetId, `${tab}!G${sheetRow}`, [[status]]);
      await updateSheetRange(sheetId, `${tab}!N${sheetRow}`, [[sanitizeCell(link)]]);
      return true;
    }
  }
  return false;
}

export type BookingDetail = Booking & {
  invoiceId: string;
  paymentMethod: string;
  paidAt: string;
  meetLink: string;
};

/** Full detail (incl. Mayar invoice id, paid-at, Meet link) for one booking, or null. */
export async function getBookingById(id: string): Promise<BookingDetail | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');
  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const rows = await readSheetValues(sheetId, `${tab}!A:P`);
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if ((row?.[ID_COL_INDEX] || '').trim() !== id) continue;
    const rawDate = row[BOOKING_DATE_COL_INDEX] || '';
    const parsed = parseBookingDateCell(rawDate);
    return {
      id,
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
      paymentLink: (row[PAYMENT_LINK_COL_INDEX] || '').trim(),
      invoiceId: (row[INVOICE_COL_INDEX] || '').trim(),
      paymentMethod: row[METHOD_COL_INDEX] || '',
      paidAt: row[PAID_AT_COL_INDEX] || '',
      meetLink: (row[MEET_LINK_COL_INDEX] || '').trim(),
    };
  }
  return null;
}

/** 1-based sheet row for a booking id, or 0 when not found. */
async function findBookingRow(sheetId: string, tab: string, id: string): Promise<number> {
  const rows = await readSheetValues(sheetId, `${tab}!A:A`);
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i]?.[0] || '').trim() === id) return i + 1;
  }
  return 0;
}

/** Record the Mayar invoice id (column H). Returns false if the id is not found. */
export async function setInvoiceId(id: string, invoiceId: string): Promise<boolean> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');
  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const sheetRow = await findBookingRow(sheetId, tab, id);
  if (!sheetRow) return false;
  await updateSheetRange(sheetId, `${tab}!H${sheetRow}`, [[sanitizeCell(invoiceId)]]);
  return true;
}

/**
 * Record the Google Meet link (column O — additive, labelled lazily like
 * column N in setPaymentProof). Returns false if the id is not found.
 */
export async function setMeetLink(id: string, link: string): Promise<boolean> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');
  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const rows = await readSheetValues(sheetId, `${tab}!A:O`);
  if (rows.length > 0 && !rows[0][MEET_LINK_COL_INDEX]) {
    await updateSheetRange(sheetId, `${tab}!O1`, [['Meet Link']]);
  }
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i]?.[ID_COL_INDEX] || '').trim() === id) {
      await updateSheetRange(sheetId, `${tab}!O${i + 1}`, [[sanitizeCell(link)]]);
      return true;
    }
  }
  return false;
}

/**
 * Record the Mayar hosted checkout link (column P — additive, labelled
 * lazily like column O in setMeetLink). Captured once at invoice-creation
 * time since it isn't derivable from the invoice id alone; lets admin
 * recover/resend it even if the Mayar invoice later expires. Returns false
 * if the id is not found.
 */
export async function setPaymentLink(id: string, link: string): Promise<boolean> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');
  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const rows = await readSheetValues(sheetId, `${tab}!A:P`);
  if (rows.length > 0 && !rows[0][PAYMENT_LINK_COL_INDEX]) {
    await updateSheetRange(sheetId, `${tab}!P1`, [['Payment Link']]);
  }
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i]?.[ID_COL_INDEX] || '').trim() === id) {
      await updateSheetRange(sheetId, `${tab}!P${i + 1}`, [[sanitizeCell(link)]]);
      return true;
    }
  }
  return false;
}

/** Mark a booking paid: status (G), payment method (I), paid-at now (K). */
export async function markPaid(id: string, method: string): Promise<boolean> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');
  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Order';
  const sheetRow = await findBookingRow(sheetId, tab, id);
  if (!sheetRow) return false;
  await updateSheetRange(sheetId, `${tab}!G${sheetRow}`, [['paid']]);
  await updateSheetRange(sheetId, `${tab}!I${sheetRow}`, [[sanitizeCell(method)]]);
  await updateSheetRange(sheetId, `${tab}!K${sheetRow}`, [[new Date().toISOString()]]);
  return true;
}
