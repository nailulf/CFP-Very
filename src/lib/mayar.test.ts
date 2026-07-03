import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createInvoice, getInvoice, invoiceUrl, isMayarConfigured } from './mayar';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  process.env.MAYAR_API_KEY = 'key-123';
  process.env.MAYAR_BASE_URL = 'https://api.mayar.club/hl/v2';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe('isMayarConfigured', () => {
  it('reflects MAYAR_API_KEY presence', () => {
    expect(isMayarConfigured()).toBe(true);
    delete process.env.MAYAR_API_KEY;
    expect(isMayarConfigured()).toBe(false);
  });
});

describe('createInvoice', () => {
  it('POSTs the invoice payload and unwraps the data envelope', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        statusCode: 200,
        messages: 'success',
        data: { id: 'inv-1', transactionId: 'txn-1', link: 'https://x.myr.id/invoices/abc' },
      }),
    );

    const inv = await createInvoice({
      bookingId: 'KB-TEST1',
      name: 'Ann',
      email: 'a@x.com',
      mobile: '0812',
      serviceLabel: 'Konsultasi Keuangan — Paket Starter',
      amount: 500000,
      expiredAt: new Date('2026-07-02T04:00:00.000Z'),
      statusUrl: 'https://site.com/konsultasi/booking/status/KB-TEST1',
    });

    expect(inv.id).toBe('inv-1');
    expect(inv.link).toBe('https://x.myr.id/invoices/abc');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.mayar.club/hl/v2/invoices/create');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer key-123');
    const body = JSON.parse(init.body);
    expect(body.items).toEqual([
      { quantity: 1, rate: 500000, description: 'Konsultasi Keuangan — Paket Starter' },
    ]);
    expect(body.expiredAt).toBe('2026-07-02T04:00:00.000Z');
    expect(body.extraData).toEqual({ bookingId: 'KB-TEST1' });
    expect(body.mobile).toBe('0812');
    expect(body.description).toContain('KB-TEST1');
    expect(body.description).toContain('https://site.com/konsultasi/booking/status/KB-TEST1');
  });

  it('throws with Mayar messages on non-2xx', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, { statusCode: 400, messages: 'validation failed', data: null }),
    );
    await expect(
      createInvoice({
        bookingId: 'KB-TEST1', name: 'A', email: 'a@x.com', mobile: '0',
        serviceLabel: 'S', amount: 1, expiredAt: new Date(), statusUrl: 'https://s',
      }),
    ).rejects.toThrow(/validation failed/);
  });

  it('throws when MAYAR_API_KEY is missing', async () => {
    delete process.env.MAYAR_API_KEY;
    await expect(getInvoice('inv-1')).rejects.toThrow(/MAYAR_API_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('getInvoice', () => {
  it('GETs the invoice detail and returns its status', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { statusCode: 200, messages: 'success', data: { id: 'inv-1', status: 'paid' } }),
    );
    const inv = await getInvoice('inv-1');
    expect(inv.status).toBe('paid');
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.mayar.club/hl/v2/invoices/inv-1');
  });
});

describe('invoiceUrl', () => {
  it('prefers the detail endpoint paymentUrl (full URL)', () => {
    expect(
      invoiceUrl({ id: 'i', link: 'eoq8cdn53g', paymentUrl: 'https://x.mayar.shop/invoices/eoq8cdn53g' }),
    ).toBe('https://x.mayar.shop/invoices/eoq8cdn53g');
  });

  it('accepts a full URL in link (create endpoint shape)', () => {
    expect(invoiceUrl({ id: 'i', link: 'https://x.mayar.shop/invoices/abc' })).toBe(
      'https://x.mayar.shop/invoices/abc',
    );
  });

  it('never returns a bare slug (would render as a broken relative href)', () => {
    expect(invoiceUrl({ id: 'i', link: 'eoq8cdn53g' })).toBeNull();
  });

  it('returns null when no url fields exist', () => {
    expect(invoiceUrl({ id: 'i' })).toBeNull();
  });
});
