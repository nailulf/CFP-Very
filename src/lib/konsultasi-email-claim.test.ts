// src/lib/konsultasi-email-claim.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const readSheetValues = vi.fn();
const updateSheetRange = vi.fn();
const appendSheetRow = vi.fn();

vi.mock('./google-sheets', () => ({
  readSheetValues: (...a: unknown[]) => readSheetValues(...a),
  updateSheetRange: (...a: unknown[]) => updateSheetRange(...a),
  appendSheetRow: (...a: unknown[]) => appendSheetRow(...a),
}));

import { claimConfirmationEmail } from './konsultasi-store';

// Columns A..P, with Q (index 16) left off — the sheet has no email column yet.
const HEADER = [
  'ID', 'Name', 'Email', 'Phone', 'Service', 'Amount', 'Payment Status',
  'DOKU Invoice ID', 'Payment Method', 'Booking Date', 'Paid At', 'Created At',
  'Topik Konsultasi', 'Bukti Pembayaran', 'Meet Link', 'Payment Link',
];

function row(id: string, emailCell?: string) {
  const r = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  r[0] = id;
  if (emailCell !== undefined) r[16] = emailCell;
  return r;
}

/**
 * The Q-column value written to a *data* row, e.g. "__sending__:1699…".
 * Ignores the Q1 header label, which is written lazily on every call.
 */
function claimedValue(): string {
  const call = updateSheetRange.mock.calls.find((c) => /!Q([2-9]|\d{2,})$/.test(String(c[1])));
  return call ? String(call[2][0][0]) : '';
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GOOGLE_SHEET_ID = 'sheet-1';
  process.env.GOOGLE_KONSULTASI_TAB = 'Order';
  updateSheetRange.mockResolvedValue(undefined);
});

describe('claimConfirmationEmail', () => {
  it('grants the claim when no email has been sent yet', async () => {
    readSheetValues.mockResolvedValue([HEADER, row('KB-1')]);
    expect(await claimConfirmationEmail('KB-1')).toBe(true);
  });

  it('writes the claim to column Q of the booking row', async () => {
    readSheetValues.mockResolvedValue([HEADER, row('KB-0'), row('KB-1')]);
    await claimConfirmationEmail('KB-1');
    // KB-1 is the 2nd data row → sheet row 3.
    expect(updateSheetRange).toHaveBeenCalledWith('sheet-1', 'Order!Q3', [[expect.any(String)]]);
  });

  it('labels the column header the first time, like the other additive columns', async () => {
    readSheetValues.mockResolvedValue([HEADER, row('KB-1')]);
    await claimConfirmationEmail('KB-1');
    expect(updateSheetRange).toHaveBeenCalledWith('sheet-1', 'Order!Q1', [['Email Konfirmasi']]);
  });

  it('refuses a second claim once an email has already been sent', async () => {
    readSheetValues.mockResolvedValue([
      HEADER,
      row('KB-1', '2026-09-18T11:06:06.570Z'),
    ]);
    expect(await claimConfirmationEmail('KB-1')).toBe(false);
  });

  it('refuses while another request holds a fresh claim', async () => {
    readSheetValues.mockResolvedValue([HEADER, row('KB-1', `__sending__:${Date.now()}`)]);
    expect(await claimConfirmationEmail('KB-1')).toBe(false);
  });

  it('takes over a claim orphaned by a crashed request', async () => {
    const stale = Date.now() - 60_000;
    readSheetValues.mockResolvedValue([HEADER, row('KB-1', `__sending__:${stale}`)]);
    expect(await claimConfirmationEmail('KB-1')).toBe(true);
  });

  it('returns false for an unknown booking id without writing anything', async () => {
    readSheetValues.mockResolvedValue([HEADER, row('KB-1')]);
    expect(await claimConfirmationEmail('KB-NOPE')).toBe(false);
    expect(claimedValue()).toBe('');
  });
});

describe('releaseConfirmationEmailClaim / markConfirmationEmailSent', () => {
  it('records the send time so a later trigger sees the email as already sent', async () => {
    const { markConfirmationEmailSent } = await import('./konsultasi-store');
    readSheetValues.mockResolvedValue([HEADER, row('KB-1', `__sending__:${Date.now()}`)]);
    await markConfirmationEmailSent('KB-1');
    const written = claimedValue();
    expect(written).not.toContain('__sending__');
    expect(Number.isNaN(Date.parse(written))).toBe(false);
  });

  it('clears the claim on failure so the next trigger can retry', async () => {
    const { releaseConfirmationEmailClaim } = await import('./konsultasi-store');
    readSheetValues.mockResolvedValue([HEADER, row('KB-1', `__sending__:${Date.now()}`)]);
    await releaseConfirmationEmailClaim('KB-1');
    expect(claimedValue()).toBe('');
  });
});
