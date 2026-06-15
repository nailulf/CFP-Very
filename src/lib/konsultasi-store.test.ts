import { describe, it, expect, vi, beforeEach } from 'vitest';

const readSheetValues = vi.fn();
const updateSheetRange = vi.fn();
const appendSheetRow = vi.fn();

vi.mock('./google-sheets', () => ({
  readSheetValues: (...a: unknown[]) => readSheetValues(...a),
  updateSheetRange: (...a: unknown[]) => updateSheetRange(...a),
  appendSheetRow: (...a: unknown[]) => appendSheetRow(...a),
}));

import { listBookings, updateBookingStatus } from './konsultasi-store';

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
