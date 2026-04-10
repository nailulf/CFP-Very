import { google } from 'googleapis';
import type { Booking } from '@/types';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const SHEET_NAME = 'Sheet1';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const HEADERS = [
  'ID', 'Name', 'Email', 'Phone', 'Service', 'Amount',
  'Payment Status', 'DOKU Invoice ID', 'Payment Method',
  'Booking Date', 'Paid At', 'Created At',
];

async function ensureHeaders(): Promise<void> {
  const sheets = getSheets();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:L1`,
  });

  const firstRow = response.data.values?.[0];

  // Only add headers if row 1 is empty or doesn't match
  if (!firstRow || firstRow[0] !== HEADERS[0]) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:L1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [HEADERS],
      },
    });
  }
}

export async function appendBookingRow(booking: {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  service_type: string;
  amount: number;
  payment_status: string;
  doku_invoice_id?: string;
  payment_method?: string;
  booking_date?: string;
  paid_at?: string;
  created_at: string;
}): Promise<void> {
  const sheets = getSheets();

  await ensureHeaders();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:L`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
          booking.id,
          booking.client_name,
          booking.client_email,
          booking.client_phone || '',
          booking.service_type,
          booking.amount,
          booking.payment_status,
          booking.doku_invoice_id || '',
          booking.payment_method || '',
          booking.booking_date || '',
          booking.paid_at || '',
          booking.created_at,
        ],
      ],
    },
  });
}

export async function updateBookingStatus(
  bookingId: string,
  updates: {
    payment_status?: string;
    doku_invoice_id?: string;
    payment_method?: string;
    paid_at?: string;
  }
): Promise<void> {
  const sheets = getSheets();

  // Find the row with the booking ID
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:A`,
  });

  const rows = response.data.values || [];
  let rowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === bookingId) {
      rowIndex = i + 1; // Sheets is 1-indexed
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error(`Booking not found: ${bookingId}`);
  }

  // Read current row
  const currentRow = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:L${rowIndex}`,
  });

  const values = currentRow.data.values?.[0] || [];

  // Update specific columns: G=payment_status, H=doku_invoice_id, I=payment_method, K=paid_at
  if (updates.payment_status) values[6] = updates.payment_status;
  if (updates.doku_invoice_id) values[7] = updates.doku_invoice_id;
  if (updates.payment_method) values[8] = updates.payment_method;
  if (updates.paid_at) values[10] = updates.paid_at;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:L${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  const sheets = getSheets();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:L`,
  });

  const rows = response.data.values || [];

  for (const row of rows) {
    if (row[0] === bookingId) {
      return {
        id: row[0],
        client_name: row[1],
        client_email: row[2],
        client_phone: row[3] || undefined,
        service_type: row[4],
        amount: Number(row[5]),
        payment_status: row[6] as Booking['payment_status'],
        doku_invoice_id: row[7] || undefined,
        payment_method: row[8] || undefined,
        booking_date: row[9] || undefined,
        paid_at: row[10] || undefined,
        created_at: row[11],
      };
    }
  }

  return null;
}
