import { describe, it, expect, vi, beforeEach } from 'vitest';

const readSheetValues = vi.fn();
const updateSheetRange = vi.fn();
const appendSheetRow = vi.fn();

vi.mock('./google-sheets', () => ({
  readSheetValues: (...a: unknown[]) => readSheetValues(...a),
  updateSheetRange: (...a: unknown[]) => updateSheetRange(...a),
  appendSheetRow: (...a: unknown[]) => appendSheetRow(...a),
}));

import {
  listBookings,
  updateBookingStatus,
  getBookingById,
  setInvoiceId,
  setMeetLink,
  markPaid,
  getBookedSlots,
} from './konsultasi-store';

const HEADER = [
  'ID','Name','Email','Phone','Service','Amount','Payment Status',
  'DOKU Invoice ID','Payment Method','Booking Date','Paid At','Created At','Topik Konsultasi',
];

describe('listBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SHEET_ID = 'sheet-1';
    process.env.GOOGLE_KONSULTASI_TAB = 'Order';
  });

  it('maps rows newest-first', async () => {
    readSheetValues.mockResolvedValue([
      HEADER,
      ['KB-1','Ann','a@x.com','08','Paket Starter','500000','pending_payment','','','2026-07-01 10:00','','2026-06-20T00:00:00Z','Dana darurat'],
      ['KB-2','Ben','b@x.com','09','Paket Family','1000000','paid','','','2026-07-02 11:00','','2026-06-21T00:00:00Z','Pensiun'],
    ]);
    const list = await listBookings();
    expect(list[0].id).toBe('KB-2');
    expect(list[1].id).toBe('KB-1');
    expect(list[0].paymentStatus).toBe('paid');
    expect(list[0].date).toBe('2026-07-02');
    expect(list[0].time).toBe('11:00');
  });

  it('returns [] for an empty sheet', async () => {
    readSheetValues.mockResolvedValue([HEADER]);
    expect(await listBookings()).toEqual([]);
  });
});

describe('updateBookingStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SHEET_ID = 'sheet-1';
    process.env.GOOGLE_KONSULTASI_TAB = 'Order';
  });

  it('writes the new status to column G of the matching row', async () => {
    readSheetValues.mockResolvedValue([
      HEADER,
      ['KB-1','Ann','a@x.com','08','Paket Starter','500000','pending_payment','','','2026-07-01 10:00','','',''],
    ]);
    const ok = await updateBookingStatus('KB-1', 'paid');
    expect(ok).toBe(true);
    expect(updateSheetRange).toHaveBeenCalledWith('sheet-1', 'Order!G2', [['paid']]);
  });

  it('returns false when the id is not found', async () => {
    readSheetValues.mockResolvedValue([HEADER]);
    expect(await updateBookingStatus('nope', 'paid')).toBe(false);
    expect(updateSheetRange).not.toHaveBeenCalled();
  });
});

describe('getBookingById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SHEET_ID = 'sheet-1';
    process.env.GOOGLE_KONSULTASI_TAB = 'Order';
  });

  it('returns full detail including invoice id and meet link', async () => {
    readSheetValues.mockResolvedValue([
      [...HEADER, 'Bukti Pembayaran', 'Meet Link'],
      ['KB-1','Ann','a@x.com','08','Paket Starter','500000','pending_payment','inv-9','mayar','2026-07-01 10:00','','2026-06-20T00:00:00Z','Dana darurat','','https://meet.google.com/abc'],
    ]);
    const b = await getBookingById('KB-1');
    expect(b?.invoiceId).toBe('inv-9');
    expect(b?.meetLink).toBe('https://meet.google.com/abc');
    expect(b?.date).toBe('2026-07-01');
    expect(b?.time).toBe('10:00');
    expect(b?.createdAt).toBe('2026-06-20T00:00:00Z');
  });

  it('returns null when not found', async () => {
    readSheetValues.mockResolvedValue([HEADER]);
    expect(await getBookingById('KB-404')).toBeNull();
  });
});

describe('setInvoiceId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SHEET_ID = 'sheet-1';
    process.env.GOOGLE_KONSULTASI_TAB = 'Order';
  });

  it('writes the invoice id to column H of the matching row', async () => {
    readSheetValues.mockResolvedValue([[ 'ID' ], ['KB-1']]);
    expect(await setInvoiceId('KB-1', 'inv-9')).toBe(true);
    expect(updateSheetRange).toHaveBeenCalledWith('sheet-1', 'Order!H2', [['inv-9']]);
  });

  it('returns false when the id is not found', async () => {
    readSheetValues.mockResolvedValue([[ 'ID' ]]);
    expect(await setInvoiceId('KB-404', 'inv-9')).toBe(false);
  });
});

describe('setMeetLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SHEET_ID = 'sheet-1';
    process.env.GOOGLE_KONSULTASI_TAB = 'Order';
  });

  it('labels O1 when missing and writes the link to column O', async () => {
    readSheetValues.mockResolvedValue([
      [...HEADER, 'Bukti Pembayaran'], // no O header yet
      ['KB-1','Ann','a@x.com','08','Paket Starter','500000','paid','inv-9','mayar','2026-07-01 10:00','','2026-06-20T00:00:00Z','',''],
    ]);
    expect(await setMeetLink('KB-1', 'https://meet.google.com/abc')).toBe(true);
    expect(updateSheetRange).toHaveBeenCalledWith('sheet-1', 'Order!O1', [['Meet Link']]);
    expect(updateSheetRange).toHaveBeenCalledWith('sheet-1', 'Order!O2', [['https://meet.google.com/abc']]);
  });
});

describe('markPaid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SHEET_ID = 'sheet-1';
    process.env.GOOGLE_KONSULTASI_TAB = 'Order';
  });

  it('writes status, method, and paid-at to G/I/K', async () => {
    readSheetValues.mockResolvedValue([[ 'ID' ], ['KB-1']]);
    expect(await markPaid('KB-1', 'qris')).toBe(true);
    expect(updateSheetRange).toHaveBeenCalledWith('sheet-1', 'Order!G2', [['paid']]);
    expect(updateSheetRange).toHaveBeenCalledWith('sheet-1', 'Order!I2', [['qris']]);
    const paidAtCall = updateSheetRange.mock.calls.find((c: unknown[]) => c[1] === 'Order!K2');
    expect(paidAtCall).toBeTruthy();
  });
});

describe('getBookedSlots payment-window release', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SHEET_ID = 'sheet-1';
    process.env.GOOGLE_KONSULTASI_TAB = 'Order';
  });

  it('drops pending_payment rows whose window has closed, keeps fresh and paid ones', async () => {
    const oldCreated = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2h ago
    const freshCreated = new Date().toISOString();
    readSheetValues.mockResolvedValue([
      HEADER,
      // expired hold — released
      ['KB-1','A','a@x.com','08','S','1','pending_payment','','','2099-01-01 10:00','',oldCreated,''],
      // fresh hold — still taken
      ['KB-2','B','b@x.com','08','S','1','pending_payment','','','2099-01-01 11:00','',freshCreated,''],
      // paid — always taken
      ['KB-3','C','c@x.com','08','S','1','paid','','','2099-01-01 12:00','',oldCreated,''],
    ]);
    const taken = await getBookedSlots();
    expect(taken.has('2099-01-01 10:00')).toBe(false);
    expect(taken.has('2099-01-01 11:00')).toBe(true);
    expect(taken.has('2099-01-01 12:00')).toBe(true);
  });
});
