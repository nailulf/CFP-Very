import 'server-only';
import {
  appendSheetRow,
  deleteSheetRow,
  readSheetValues,
  updateSheetRange,
} from './google-sheets';

export type InvoiceStatus = 'Unpaid' | 'Paid' | 'Cancelled';

export type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoicePayload = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  issuer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
  };
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxType: 'PPN' | 'PPh';
  taxPercent: number;
  taxAmount: number;
  total: number;
  paymentAccountId: string;
  paymentAccountLabel: string;
  paymentAccountNumber: string;
  notes: string;
};

export type StoredInvoice = {
  id: string;
  savedAt: string;
  status: InvoiceStatus;
  createdBy: string;
  payload: InvoicePayload;
};

export const HEADERS = [
  'ID',
  'Saved At',
  'Status',
  'Invoice #',
  'Issue Date',
  'Due Date',
  'Currency',
  'Client Name',
  'Client Email',
  'Client Phone',
  'Items',
  'Subtotal',
  'Discount %',
  'Discount Amount',
  'Tax %',
  'Tax Amount',
  'Total',
  'Payment Account',
  'Payment Number',
  'Notes',
  'Created By',
  'Payload',
];

const COL = {
  ID: 0,
  SAVED_AT: 1,
  STATUS: 2,
  INVOICE_NUMBER: 3,
  ISSUE_DATE: 4,
  DUE_DATE: 5,
  CURRENCY: 6,
  CLIENT_NAME: 7,
  CLIENT_EMAIL: 8,
  CLIENT_PHONE: 9,
  ITEMS_SUMMARY: 10,
  SUBTOTAL: 11,
  DISCOUNT_PERCENT: 12,
  DISCOUNT_AMOUNT: 13,
  TAX_PERCENT: 14,
  TAX_AMOUNT: 15,
  TOTAL: 16,
  PAYMENT_LABEL: 17,
  PAYMENT_NUMBER: 18,
  NOTES: 19,
  CREATED_BY: 20,
  PAYLOAD: 21,
};

const colLetter = (idx: number) => String.fromCharCode(65 + idx);

function getConfig() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    throw new Error('GOOGLE_SHEET_ID is not configured.');
  }
  const tab = process.env.GOOGLE_INVOICE_SHEET_TAB || 'Invoices';
  return { sheetId, tab, range: `${tab}!A:Z` };
}

function rowToStored(row: string[]): StoredInvoice | null {
  const id = row[COL.ID];
  if (!id) return null;
  let payload: InvoicePayload | null = null;
  try {
    payload = row[COL.PAYLOAD]
      ? (JSON.parse(row[COL.PAYLOAD]) as InvoicePayload)
      : null;
  } catch {
    payload = null;
  }
  if (!payload) return null;
  if (payload.taxType !== 'PPN' && payload.taxType !== 'PPh') {
    payload.taxType = 'PPN';
  }
  const statusRaw = (row[COL.STATUS] || 'Unpaid') as InvoiceStatus;
  const status: InvoiceStatus =
    statusRaw === 'Paid' || statusRaw === 'Cancelled' ? statusRaw : 'Unpaid';
  return {
    id,
    savedAt: row[COL.SAVED_AT] || '',
    status,
    createdBy: row[COL.CREATED_BY] || '',
    payload,
  };
}

function buildRow(
  id: string,
  savedAt: string,
  status: InvoiceStatus,
  createdBy: string,
  payload: InvoicePayload
): (string | number)[] {
  const itemsSummary = payload.items
    .map((i) => `${i.quantity} × ${i.description || '—'} @ ${i.unitPrice}`)
    .join('; ');
  return [
    id,
    savedAt,
    status,
    payload.invoiceNumber,
    payload.issueDate,
    payload.dueDate,
    payload.currency,
    payload.client.name,
    payload.client.email,
    payload.client.phone,
    itemsSummary,
    payload.subtotal,
    payload.discountPercent,
    payload.discountAmount,
    payload.taxPercent,
    payload.taxAmount,
    payload.total,
    payload.paymentAccountLabel,
    payload.paymentAccountNumber,
    payload.notes,
    createdBy,
    JSON.stringify(payload),
  ];
}

async function readAllRows(): Promise<string[][]> {
  const { sheetId, range } = getConfig();
  return readSheetValues(sheetId, range);
}

export async function listInvoices(): Promise<StoredInvoice[]> {
  const rows = await readAllRows();
  if (rows.length === 0) return [];
  const dataRows = rows.slice(1); // skip header
  return dataRows
    .map(rowToStored)
    .filter((x): x is StoredInvoice => x !== null)
    .reverse(); // newest first
}

export async function getInvoiceById(id: string): Promise<StoredInvoice | null> {
  const rows = await readAllRows();
  const dataRows = rows.slice(1);
  const found = dataRows.find((r) => r[COL.ID] === id);
  if (!found) return null;
  return rowToStored(found);
}

export async function createInvoice(args: {
  payload: InvoicePayload;
  createdBy: string;
}): Promise<StoredInvoice> {
  const { sheetId, tab, range } = getConfig();
  const existing = await readSheetValues(sheetId, range);
  if (existing.length === 0) {
    await appendSheetRow(sheetId, range, HEADERS);
  }
  const id = crypto.randomUUID();
  const savedAt = new Date().toISOString();
  const status: InvoiceStatus = 'Unpaid';
  await appendSheetRow(
    sheetId,
    `${tab}!A:Z`,
    buildRow(id, savedAt, status, args.createdBy, args.payload)
  );
  return { id, savedAt, status, createdBy: args.createdBy, payload: args.payload };
}

async function findRowIndex(id: string): Promise<{
  rows: string[][];
  rowIndex: number;
} | null> {
  const rows = await readAllRows();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][COL.ID] === id) {
      return { rows, rowIndex: i };
    }
  }
  return null;
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<boolean> {
  const found = await findRowIndex(id);
  if (!found) return false;
  const { sheetId, tab } = getConfig();
  const cell = `${tab}!${colLetter(COL.STATUS)}${found.rowIndex + 1}`;
  await updateSheetRange(sheetId, cell, [[status]]);
  return true;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const found = await findRowIndex(id);
  if (!found) return false;
  const { sheetId, tab } = getConfig();
  await deleteSheetRow(sheetId, tab, found.rowIndex);
  return true;
}
