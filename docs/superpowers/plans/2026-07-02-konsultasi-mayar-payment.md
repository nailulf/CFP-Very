# Konsultasi Mayar.id Payment Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the manual bank-transfer + proof-upload payment step of the konsultasi booking flow with Mayar.id hosted checkout, confirmed automatically via webhook + polling reconciliation.

**Architecture:** The book route creates a Mayar invoice (1-hour expiry, clamped to appointment start) after appending the booking row to Google Sheets, then the client auto-redirects to Mayar's hosted page. Payment is confirmed by two independent paths — a token-gated webhook and a self-healing public status endpoint — both of which only trust a re-fetch of the invoice from Mayar's API (webhooks are unsigned). The Calendar event + Meet invite move from booking-time to paid-time.

**Tech Stack:** Next.js 16 App Router (route handlers), TypeScript, Google Sheets store (existing), Mayar Headless API v2 (plain `fetch`, no SDK), Vitest.

**Spec:** `docs/superpowers/specs/2026-07-02-konsultasi-mayar-payment-design.md`. One placement deviation from the spec: `confirmPayment`/reconciliation live in a new `src/lib/konsultasi-payment-confirm.ts` (not inside `konsultasi-store.ts`) so the sheets store stays free of Mayar/Calendar imports and its existing tests keep mocking only `google-sheets`.

## Global Constraints

- **Sheet structure preserved**: never remove/rename existing columns; column H (`DOKU Invoice ID`) is reused for the Mayar invoice UUID; column O (`Meet Link`) is additive-only, header written lazily (same pattern as column N in `setPaymentProof`).
- **i18n**: every user-facing string goes in `src/lib/translations.ts`, Indonesian first, English immediately after; no i18n library.
- **Design tokens**: page bg `#F0F7FA`; white cards with `#E0EBF5` border; CTA amber `#f79d35`; success text `#1B7A3F`; error text `#8C1C00`; warning bg `#FFF8E1` text `#D97706`; input/label styles copied from `BookingFlow.tsx`.
- **Payment truth**: a booking is only ever marked `paid` after `GET /invoices/{id}` on Mayar returns `status === 'paid'`. Webhook payloads are hints, never truth.
- **No new dependencies.** Plain `fetch` for Mayar.
- **Env vars**: `MAYAR_API_KEY`, `MAYAR_BASE_URL` (dev: `https://api.mayar.club/hl/v2`, prod: `https://api.mayar.id/hl/v2`), `MAYAR_WEBHOOK_TOKEN` (long random string).
- **Tests**: Vitest (`npm run test`), node env, TZ pinned to Asia/Jakarta, `@` → `src`, `server-only` stubbed. Mock `./google-sheets` exactly like `src/lib/konsultasi-store.test.ts` does.
- **Booking statuses**: `pending_payment` → `paid` | `expired` | `cancelled` | `refunded`. `expired` is already in `RELEASED_STATUSES`. Legacy `menunggu_verifikasi` rows are left alone.

---

### Task 1: Payment-window helpers (pure)

**Files:**
- Create: `src/lib/konsultasi-payment-window.ts`
- Test: `src/lib/konsultasi-payment-window.test.ts`

**Interfaces:**
- Consumes: nothing (pure).
- Produces: `PAYMENT_WINDOW_MS: number`; `paymentDeadline(createdAtISO: string, date: string | null, time: string | null): Date | null`; `isPaymentExpired(createdAtISO: string, date: string | null, time: string | null, now: Date): boolean`. Used by Tasks 3, 4, 5.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/konsultasi-payment-window.test.ts
import { describe, it, expect } from 'vitest';
import { PAYMENT_WINDOW_MS, paymentDeadline, isPaymentExpired } from './konsultasi-payment-window';

describe('paymentDeadline', () => {
  it('is createdAt + 1h when the appointment is far away', () => {
    const d = paymentDeadline('2026-07-02T03:00:00.000Z', '2026-07-10', '10:00');
    expect(d?.toISOString()).toBe('2026-07-02T04:00:00.000Z');
  });

  it('clamps to the appointment start (WIB) when that is sooner', () => {
    // Appointment 2026-07-02 10:30 WIB = 03:30 UTC; created 03:00 UTC.
    const d = paymentDeadline('2026-07-02T03:00:00.000Z', '2026-07-02', '10:30');
    expect(d?.toISOString()).toBe('2026-07-02T03:30:00.000Z');
  });

  it('ignores the clamp when date/time are missing', () => {
    const d = paymentDeadline('2026-07-02T03:00:00.000Z', null, null);
    expect(d?.toISOString()).toBe('2026-07-02T04:00:00.000Z');
  });

  it('returns null for an unparsable createdAt', () => {
    expect(paymentDeadline('not-a-date', '2026-07-10', '10:00')).toBeNull();
  });

  it('exports a 1-hour window', () => {
    expect(PAYMENT_WINDOW_MS).toBe(60 * 60 * 1000);
  });
});

describe('isPaymentExpired', () => {
  const created = '2026-07-02T03:00:00.000Z';

  it('is false inside the window', () => {
    expect(isPaymentExpired(created, '2026-07-10', '10:00', new Date('2026-07-02T03:59:00Z'))).toBe(false);
  });

  it('is true after the window', () => {
    expect(isPaymentExpired(created, '2026-07-10', '10:00', new Date('2026-07-02T04:00:01Z'))).toBe(true);
  });

  it('is true once the appointment has started even within 1h of creation', () => {
    expect(isPaymentExpired(created, '2026-07-02', '10:30', new Date('2026-07-02T03:31:00Z'))).toBe(true);
  });

  it('fails safe (not expired) when createdAt is malformed', () => {
    expect(isPaymentExpired('', '2026-07-10', '10:00', new Date('2027-01-01T00:00:00Z'))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/konsultasi-payment-window.test.ts`
Expected: FAIL — cannot resolve `./konsultasi-payment-window`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/konsultasi-payment-window.ts

/** How long an unpaid booking holds its slot (and its Mayar invoice stays payable). */
export const PAYMENT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * When payment must be completed: createdAt + 1h, clamped to the appointment
 * start (WIB). Returns null when createdAt can't be parsed.
 */
export function paymentDeadline(
  createdAtISO: string,
  date: string | null,
  time: string | null,
): Date | null {
  const created = new Date(createdAtISO);
  if (Number.isNaN(created.getTime())) return null;
  let deadline = created.getTime() + PAYMENT_WINDOW_MS;
  if (date && time) {
    const appt = new Date(`${date}T${time}:00+07:00`).getTime();
    if (!Number.isNaN(appt)) deadline = Math.min(deadline, appt);
  }
  return new Date(deadline);
}

/**
 * True when an unpaid booking's payment window has closed. A malformed
 * createdAt fails safe (not expired) so a bad row never silently frees a slot
 * that might still get paid.
 */
export function isPaymentExpired(
  createdAtISO: string,
  date: string | null,
  time: string | null,
  now: Date,
): boolean {
  const deadline = paymentDeadline(createdAtISO, date, time);
  if (!deadline) return false;
  return now.getTime() > deadline.getTime();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/konsultasi-payment-window.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/konsultasi-payment-window.ts src/lib/konsultasi-payment-window.test.ts
git commit -m "feat(konsultasi): payment-window helpers (1h deadline clamped to appointment)"
```

---

### Task 2: Mayar API client

**Files:**
- Create: `src/lib/mayar.ts`
- Test: `src/lib/mayar.test.ts`

**Interfaces:**
- Consumes: env `MAYAR_API_KEY`, `MAYAR_BASE_URL`.
- Produces (used by Tasks 4, 5):
  - `isMayarConfigured(): boolean`
  - `createInvoice(input: CreateInvoiceInput): Promise<MayarInvoice>` where `CreateInvoiceInput = { bookingId: string; name: string; email: string; mobile: string; serviceLabel: string; amount: number; expiredAt: Date; statusUrl: string }`
  - `getInvoice(id: string): Promise<MayarInvoice>` where `MayarInvoice = { id: string; transactionId?: string; link?: string; status?: string }` (`status` is `'paid' | 'unpaid' | 'closed'` on the detail endpoint)

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/mayar.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createInvoice, getInvoice, isMayarConfigured } from './mayar';

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/mayar.test.ts`
Expected: FAIL — cannot resolve `./mayar`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/mayar.ts
import 'server-only';

// Thin client for the Mayar Headless API v2 (https://docs.mayar.id/api-reference-v2/introduction).
// Sandbox base URL: https://api.mayar.club/hl/v2 — select via MAYAR_BASE_URL.
const DEFAULT_BASE_URL = 'https://api.mayar.id/hl/v2';

type MayarEnvelope<T> = { statusCode: number; messages: string; data: T };

export type MayarInvoice = {
  id: string;
  transactionId?: string;
  /** Hosted payment page URL for the customer. */
  link?: string;
  /** Present on the detail endpoint: 'paid' | 'unpaid' | 'closed'. */
  status?: string;
};

export function isMayarConfigured(): boolean {
  return Boolean(process.env.MAYAR_API_KEY);
}

async function mayarFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.MAYAR_API_KEY;
  if (!key) throw new Error('MAYAR_API_KEY not configured');
  const base = (process.env.MAYAR_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  const body = (await res.json().catch(() => null)) as MayarEnvelope<T> | null;
  if (!res.ok || !body) {
    throw new Error(`Mayar ${path} failed (${res.status}): ${body?.messages ?? 'no response body'}`);
  }
  return body.data;
}

export type CreateInvoiceInput = {
  bookingId: string;
  name: string;
  email: string;
  mobile: string;
  /** Stable service label recorded to the sheet, e.g. 'Konsultasi Keuangan — Paket Starter'. */
  serviceLabel: string;
  /** IDR. */
  amount: number;
  expiredAt: Date;
  /** Public status-page URL — included on the invoice so the customer can find their way back. */
  statusUrl: string;
};

export async function createInvoice(input: CreateInvoiceInput): Promise<MayarInvoice> {
  return mayarFetch<MayarInvoice>('/invoices/create', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      mobile: input.mobile || '-',
      items: [{ quantity: 1, rate: input.amount, description: input.serviceLabel }],
      description: `${input.bookingId} — ${input.serviceLabel}\nCek status booking: ${input.statusUrl}`,
      expiredAt: input.expiredAt.toISOString(),
      extraData: { bookingId: input.bookingId },
    }),
  });
}

export async function getInvoice(id: string): Promise<MayarInvoice> {
  return mayarFetch<MayarInvoice>(`/invoices/${encodeURIComponent(id)}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/mayar.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/mayar.ts src/lib/mayar.test.ts
git commit -m "feat(konsultasi): Mayar API v2 client (create/get invoice)"
```

---

### Task 3: Store helpers + expired-slot release

**Files:**
- Modify: `src/lib/konsultasi-store.ts`
- Test: `src/lib/konsultasi-store.test.ts` (append new describes)

**Interfaces:**
- Consumes: `isPaymentExpired` from Task 1.
- Produces (used by Tasks 4, 5):
  - `getBookingById(id: string): Promise<BookingDetail | null>` where `BookingDetail = Booking & { invoiceId: string; paymentMethod: string; paidAt: string; meetLink: string }`
  - `setInvoiceId(id: string, invoiceId: string): Promise<boolean>` — writes column H
  - `setMeetLink(id: string, link: string): Promise<boolean>` — writes column O, labels `O1` lazily
  - `markPaid(id: string, method: string): Promise<boolean>` — writes G=`paid`, I=method, K=now ISO
  - `getBookedSlots()` (existing) now skips `pending_payment` rows whose payment window has closed

- [ ] **Step 1: Write the failing tests** (append to `src/lib/konsultasi-store.test.ts`; note the existing `HEADER` const is 13 columns — extend rows inline where columns N/O matter)

```ts
import { getBookingById, setInvoiceId, setMeetLink, markPaid, getBookedSlots } from './konsultasi-store';

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
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npx vitest run src/lib/konsultasi-store.test.ts`
Expected: FAIL — `getBookingById` etc. are not exported. The pre-existing describes must still pass.

- [ ] **Step 3: Implement in `src/lib/konsultasi-store.ts`**

3a. Add import at the top (after the existing imports):

```ts
import { isPaymentExpired } from './konsultasi-payment-window';
```

3b. Add column indexes next to the existing ones (`PROOF_COL_INDEX` is already 13):

```ts
const INVOICE_COL_INDEX = 7; // column H — "DOKU Invoice ID" (now: Mayar invoice ID)
const METHOD_COL_INDEX = 8; // column I — "Payment Method"
const PAID_AT_COL_INDEX = 10; // column K — "Paid At"
const MEET_LINK_COL_INDEX = 14; // column O — "Meet Link" (additive, labelled lazily)
```

3c. In `getBookedSlots`, replace the loop body's last two lines:

```ts
    const parsed = parseBookingDateCell(row[BOOKING_DATE_COL_INDEX] || '');
    if (parsed) taken.add(slotKey(parsed.date, parsed.time));
```

with:

```ts
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
```

(`CREATED_AT_COL_INDEX` is declared later in the module — that's fine, it's evaluated at call time.)

3d. Append the new type and functions at the end of the file:

```ts
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
  const rows = await readSheetValues(sheetId, `${tab}!A:O`);
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
```

- [ ] **Step 4: Run the full store test file**

Run: `npx vitest run src/lib/konsultasi-store.test.ts`
Expected: PASS — all pre-existing + new tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/konsultasi-store.ts src/lib/konsultasi-store.test.ts
git commit -m "feat(konsultasi): store helpers for invoice id, meet link, paid marking; release expired holds"
```

---

### Task 4: Payment confirmation & reconciliation lib

**Files:**
- Create: `src/lib/konsultasi-payment-confirm.ts`
- Test: `src/lib/konsultasi-payment-confirm.test.ts`

**Interfaces:**
- Consumes: Task 2 (`getInvoice`, `createInvoice`, `isMayarConfigured`), Task 3 (`getBookingById`, `markPaid`, `setInvoiceId`, `setMeetLink`, `updateBookingStatus`, `listBookings`), Task 1 (`isPaymentExpired`, `paymentDeadline`, `PAYMENT_WINDOW_MS`), existing `createBookingEvent` (`src/lib/google-calendar.ts`) and `getAvailabilityConfig` (`src/lib/settings-store.ts`, returns `{ slotMinutes: number, ... }`).
- Produces (used by Tasks 6, 7):
  - `confirmPayment(bookingId: string): Promise<boolean>`
  - `reconcileAllPending(limit?: number): Promise<void>`
  - `reconcileBookingStatus(bookingId: string, origin: string): Promise<BookingStatusResult | null>` where `BookingStatusResult = { status: string; paymentUrl: string | null; meetLink: string | null; service: string; date: string | null; time: string | null; amount: string }`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/konsultasi-payment-confirm.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getInvoice = vi.fn();
const createInvoice = vi.fn();
const isMayarConfigured = vi.fn(() => true);
vi.mock('./mayar', () => ({
  getInvoice: (...a: unknown[]) => getInvoice(...a),
  createInvoice: (...a: unknown[]) => createInvoice(...a),
  isMayarConfigured: () => isMayarConfigured(),
}));

const getBookingById = vi.fn();
const listBookings = vi.fn();
const markPaid = vi.fn();
const setInvoiceId = vi.fn();
const setMeetLink = vi.fn();
const updateBookingStatus = vi.fn();
vi.mock('./konsultasi-store', () => ({
  getBookingById: (...a: unknown[]) => getBookingById(...a),
  listBookings: (...a: unknown[]) => listBookings(...a),
  markPaid: (...a: unknown[]) => markPaid(...a),
  setInvoiceId: (...a: unknown[]) => setInvoiceId(...a),
  setMeetLink: (...a: unknown[]) => setMeetLink(...a),
  updateBookingStatus: (...a: unknown[]) => updateBookingStatus(...a),
}));

const createBookingEvent = vi.fn();
vi.mock('./google-calendar', () => ({
  createBookingEvent: (...a: unknown[]) => createBookingEvent(...a),
}));

const getAvailabilityConfig = vi.fn();
vi.mock('./settings-store', () => ({
  getAvailabilityConfig: (...a: unknown[]) => getAvailabilityConfig(...a),
}));

import { confirmPayment, reconcileBookingStatus } from './konsultasi-payment-confirm';

const FRESH = new Date().toISOString();
const STALE = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

function booking(overrides: Record<string, unknown> = {}) {
  return {
    id: 'KB-1', name: 'Ann', email: 'a@x.com', phone: '0812',
    service: 'Konsultasi Keuangan — Paket Starter', amount: '500000',
    paymentStatus: 'pending_payment', bookingDate: '2099-01-01 10:00',
    date: '2099-01-01', time: '10:00', topic: 'Dana darurat',
    createdAt: FRESH, invoiceId: 'inv-1', paymentMethod: '', paidAt: '', meetLink: '',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  isMayarConfigured.mockReturnValue(true);
  getAvailabilityConfig.mockResolvedValue({ slotMinutes: 90 });
  createBookingEvent.mockResolvedValue({ meetLink: 'https://meet.google.com/abc' });
});

describe('confirmPayment', () => {
  it('marks paid + creates the calendar event only when Mayar says paid', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    expect(await confirmPayment('KB-1')).toBe(true);
    expect(markPaid).toHaveBeenCalledWith('KB-1', 'mayar');
    expect(createBookingEvent).toHaveBeenCalled();
    expect(setMeetLink).toHaveBeenCalledWith('KB-1', 'https://meet.google.com/abc');
  });

  it('does nothing when Mayar says unpaid', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'unpaid' });
    expect(await confirmPayment('KB-1')).toBe(false);
    expect(markPaid).not.toHaveBeenCalled();
  });

  it('is idempotent: an already-paid booking only retries the calendar event', async () => {
    getBookingById.mockResolvedValue(booking({ paymentStatus: 'paid' }));
    expect(await confirmPayment('KB-1')).toBe(true);
    expect(getInvoice).not.toHaveBeenCalled();
    expect(markPaid).not.toHaveBeenCalled();
    expect(createBookingEvent).toHaveBeenCalled();
  });

  it('never flips cancelled/refunded bookings back to paid', async () => {
    getBookingById.mockResolvedValue(booking({ paymentStatus: 'refunded' }));
    expect(await confirmPayment('KB-1')).toBe(false);
    expect(getInvoice).not.toHaveBeenCalled();
    expect(markPaid).not.toHaveBeenCalled();
  });

  it('allows expired → paid (customer money wins)', async () => {
    getBookingById.mockResolvedValue(booking({ paymentStatus: 'expired' }));
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    expect(await confirmPayment('KB-1')).toBe(true);
    expect(markPaid).toHaveBeenCalledWith('KB-1', 'mayar');
  });

  it('returns false for a missing booking or missing invoice id', async () => {
    getBookingById.mockResolvedValue(null);
    expect(await confirmPayment('KB-404')).toBe(false);
    getBookingById.mockResolvedValue(booking({ invoiceId: '' }));
    expect(await confirmPayment('KB-1')).toBe(false);
  });
});

describe('reconcileBookingStatus', () => {
  const ORIGIN = 'https://site.com';

  it('returns null for a missing booking', async () => {
    getBookingById.mockResolvedValue(null);
    expect(await reconcileBookingStatus('KB-404', ORIGIN)).toBeNull();
  });

  it('marks a stale pending booking expired (after a last-chance Mayar check)', async () => {
    getBookingById.mockResolvedValue(booking({ createdAt: STALE }));
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'unpaid' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('expired');
    expect(updateBookingStatus).toHaveBeenCalledWith('KB-1', 'expired');
  });

  it('paid wins over expired on the last-chance check', async () => {
    getBookingById.mockResolvedValue(booking({ createdAt: STALE }));
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('paid');
    expect(markPaid).toHaveBeenCalledWith('KB-1', 'mayar');
    expect(updateBookingStatus).not.toHaveBeenCalledWith('KB-1', 'expired');
  });

  it('self-heals a booking without an invoice by creating one', async () => {
    getBookingById.mockResolvedValue(booking({ invoiceId: '' }));
    createInvoice.mockResolvedValue({ id: 'inv-new', link: 'https://x.myr.id/invoices/new' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('pending_payment');
    expect(r?.paymentUrl).toBe('https://x.myr.id/invoices/new');
    expect(setInvoiceId).toHaveBeenCalledWith('KB-1', 'inv-new');
    const arg = createInvoice.mock.calls[0][0];
    expect(arg.statusUrl).toBe('https://site.com/konsultasi/booking/status/KB-1');
    expect(arg.amount).toBe(500000);
  });

  it('reconciles a missed webhook: pending in sheet, paid on Mayar', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('paid');
    expect(markPaid).toHaveBeenCalledWith('KB-1', 'mayar');
  });

  it('marks expired when Mayar closed the invoice', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'closed' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('expired');
    expect(updateBookingStatus).toHaveBeenCalledWith('KB-1', 'expired');
  });

  it('returns the payment link while still unpaid', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'unpaid', link: 'https://x.myr.id/invoices/abc' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('pending_payment');
    expect(r?.paymentUrl).toBe('https://x.myr.id/invoices/abc');
  });

  it('stays pending (no crash) when Mayar is down', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockRejectedValue(new Error('ECONNREFUSED'));
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('pending_payment');
    expect(r?.paymentUrl).toBeNull();
  });

  it('retries the calendar event for a paid booking with no meet link yet', async () => {
    getBookingById.mockResolvedValue(booking({ paymentStatus: 'paid', meetLink: '' }));
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('paid');
    expect(createBookingEvent).toHaveBeenCalled();
    expect(r?.meetLink).toBe('https://meet.google.com/abc');
  });

  it('passes terminal statuses through untouched', async () => {
    getBookingById.mockResolvedValue(booking({ paymentStatus: 'cancelled' }));
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('cancelled');
    expect(getInvoice).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/konsultasi-payment-confirm.test.ts`
Expected: FAIL — cannot resolve `./konsultasi-payment-confirm`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/konsultasi-payment-confirm.ts
import 'server-only';
import { createInvoice, getInvoice, isMayarConfigured } from './mayar';
import {
  getBookingById,
  listBookings,
  markPaid,
  setInvoiceId,
  setMeetLink,
  updateBookingStatus,
  type BookingDetail,
} from './konsultasi-store';
import { createBookingEvent } from './google-calendar';
import { getAvailabilityConfig } from './settings-store';
import { isPaymentExpired, paymentDeadline, PAYMENT_WINDOW_MS } from './konsultasi-payment-window';

// Statuses a payment confirmation may transition from. `expired` is included
// because a customer who paid at the buzzer wins over our expiry ('paid' beats
// 'expired'); admin-set cancelled/refunded are never overridden by a webhook.
const CONFIRMABLE_STATUSES = new Set(['pending_payment', 'expired', 'menunggu_verifikasi']);

/**
 * Create the Calendar event + Meet invite for a paid booking. Idempotent via
 * column O; best-effort exactly like the old book-route behavior.
 */
async function ensureCalendarEvent(b: BookingDetail): Promise<string | null> {
  if (b.meetLink) return b.meetLink;
  if (!b.date || !b.time) return null;
  const config = await getAvailabilityConfig();
  const event = await createBookingEvent({
    date: b.date,
    time: b.time,
    durationMinutes: config.slotMinutes,
    summary: `Konsultasi Keuangan — ${b.service.replace(/^Konsultasi Keuangan — /, '')} (${b.name})`,
    description: [
      `Paket: ${b.service}`,
      `Nama: ${b.name}`,
      `Topik: ${b.topic}`,
      `No. Ref: ${b.id}`,
    ].join('\n'),
    clientEmail: b.email,
  });
  if (event.meetLink) await setMeetLink(b.id, event.meetLink);
  return event.meetLink ?? null;
}

/**
 * Mark a booking paid — but only after Mayar itself confirms the invoice is
 * paid (webhooks are unsigned; the API re-fetch is the only trusted source).
 * Idempotent: an already-paid booking only retries its calendar event.
 */
export async function confirmPayment(bookingId: string): Promise<boolean> {
  const b = await getBookingById(bookingId);
  if (!b) return false;
  if (b.paymentStatus === 'paid') {
    await ensureCalendarEvent(b);
    return true;
  }
  if (!CONFIRMABLE_STATUSES.has(b.paymentStatus)) return false;
  if (!b.invoiceId) return false;
  const invoice = await getInvoice(b.invoiceId);
  if (invoice.status !== 'paid') return false;
  await markPaid(bookingId, 'mayar');
  await ensureCalendarEvent(b);
  return true;
}

/**
 * Webhook fallback when no bookingId can be extracted from the payload:
 * reconcile the most recent pending bookings against Mayar.
 */
export async function reconcileAllPending(limit = 20): Promise<void> {
  const bookings = await listBookings(); // newest first
  const pending = bookings.filter((b) => b.paymentStatus === 'pending_payment').slice(0, limit);
  for (const b of pending) {
    try {
      await confirmPayment(b.id);
    } catch (error) {
      console.error(`reconcileAllPending: ${b.id} failed`, error);
    }
  }
}

export type BookingStatusResult = {
  status: string;
  paymentUrl: string | null;
  meetLink: string | null;
  service: string;
  date: string | null;
  time: string | null;
  amount: string;
};

/**
 * Source of truth for the public status page: handles expiry, invoice
 * self-healing (Mayar was down at booking time), and payment reconciliation
 * (missed webhook) in one pass. Intentionally returns no name/email/phone —
 * booking ids are guessable timestamps, so the payload stays low-PII.
 */
export async function reconcileBookingStatus(
  bookingId: string,
  origin: string,
): Promise<BookingStatusResult | null> {
  const b = await getBookingById(bookingId);
  if (!b) return null;

  const result = (status: string, paymentUrl: string | null = null): BookingStatusResult => ({
    status,
    paymentUrl,
    meetLink: b.meetLink || null,
    service: b.service,
    date: b.date,
    time: b.time,
    amount: b.amount,
  });

  if (b.paymentStatus === 'paid') {
    // Retry the calendar event while column O is still empty.
    const meetLink = await ensureCalendarEvent(b);
    return { ...result('paid'), meetLink };
  }
  if (b.paymentStatus !== 'pending_payment') return result(b.paymentStatus);

  // Expiry: 1-hour window, clamped to the appointment start.
  if (isPaymentExpired(b.createdAt, b.date, b.time, new Date())) {
    if (b.invoiceId) {
      // Last-chance check — a payment at 59:59 beats our expiry.
      try {
        if (await confirmPayment(bookingId)) {
          const fresh = await getBookingById(bookingId);
          return { ...result('paid'), meetLink: fresh?.meetLink || null };
        }
      } catch (error) {
        console.error(`reconcileBookingStatus: last-chance check failed for ${bookingId}`, error);
      }
    }
    await updateBookingStatus(bookingId, 'expired');
    return result('expired');
  }

  // Self-heal: Mayar was down when the booking was created — no invoice yet.
  if (!b.invoiceId) {
    if (!isMayarConfigured()) return result('pending_payment');
    try {
      const invoice = await createInvoice({
        bookingId,
        name: b.name,
        email: b.email,
        mobile: b.phone,
        serviceLabel: b.service,
        amount: Number(b.amount) || 0,
        expiredAt:
          paymentDeadline(b.createdAt, b.date, b.time) ?? new Date(Date.now() + PAYMENT_WINDOW_MS),
        statusUrl: `${origin}/konsultasi/booking/status/${bookingId}`,
      });
      await setInvoiceId(bookingId, invoice.id);
      return result('pending_payment', invoice.link ?? null);
    } catch (error) {
      console.error(`reconcileBookingStatus: self-heal invoice failed for ${bookingId}`, error);
      return result('pending_payment');
    }
  }

  // Reconcile against Mayar (covers a missed webhook).
  try {
    const invoice = await getInvoice(b.invoiceId);
    if (invoice.status === 'paid') {
      await markPaid(bookingId, 'mayar');
      const meetLink = await ensureCalendarEvent(b);
      return { ...result('paid'), meetLink };
    }
    if (invoice.status === 'closed') {
      await updateBookingStatus(bookingId, 'expired');
      return result('expired');
    }
    return result('pending_payment', invoice.link ?? null);
  } catch (error) {
    // Mayar down — stay pending; the page polls again shortly.
    console.error(`reconcileBookingStatus: reconcile failed for ${bookingId}`, error);
    return result('pending_payment');
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/konsultasi-payment-confirm.test.ts`
Expected: PASS (all describes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/konsultasi-payment-confirm.ts src/lib/konsultasi-payment-confirm.test.ts
git commit -m "feat(konsultasi): payment confirmation + reconciliation (verify-with-Mayar, expiry, self-heal)"
```

---

### Task 5: Book route — create invoice, drop calendar-at-booking

**Files:**
- Modify: `src/app/api/konsultasi/book/route.ts`

**Interfaces:**
- Consumes: Task 2 (`createInvoice`, `isMayarConfigured`), Task 3 (`setInvoiceId`), Task 1 (`paymentDeadline`, `PAYMENT_WINDOW_MS`).
- Produces: response shape `{ success: true, bookingId: string, paymentUrl: string | null }` — consumed by BookingFlow (Task 10). `meetLink`/`eventLink` are removed.

- [ ] **Step 1: Rewrite the route**

Replace the full contents of `src/app/api/konsultasi/book/route.ts` with:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isSlotAvailable } from '@/lib/konsultasi-availability';
import { appendBooking, setInvoiceId } from '@/lib/konsultasi-store';
import { KONSULTASI_PACKAGE_IDS, getKonsultasiPackage } from '@/lib/konsultasi-packages';
import { getAvailabilityConfig, getPackagePricing } from '@/lib/settings-store';
import { resolveAmount } from '@/lib/settings-config';
import { createInvoice, isMayarConfigured } from '@/lib/mayar';
import { paymentDeadline, PAYMENT_WINDOW_MS } from '@/lib/konsultasi-payment-window';

const schema = z.object({
  packageId: z.enum(KONSULTASI_PACKAGE_IDS),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  // Fully optional, free-text.
  topic: z.string().max(2000).optional().default(''),
});

function makeBookingId(now: Date): string {
  return `KB-${now.getTime().toString(36).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Invalid form data' }, { status: 400 });
    }

    const { packageId, name, email, phone, date, timeSlot, topic } = parsed.data;

    const pkg = getKonsultasiPackage(packageId);
    if (!pkg) {
      return NextResponse.json({ success: false, message: 'Paket tidak valid.' }, { status: 400 });
    }

    const config = await getAvailabilityConfig();
    if (!(await isSlotAvailable(config, date, timeSlot, new Date()))) {
      return NextResponse.json(
        { success: false, message: 'Jadwal yang dipilih sudah tidak tersedia.' },
        { status: 400 },
      );
    }

    const pricing = await getPackagePricing();
    const amount = resolveAmount(pricing[packageId]);

    const now = new Date();
    const bookingId = makeBookingId(now);
    await appendBooking({
      bookingId,
      name,
      email,
      phone: phone ?? '',
      date,
      timeSlot,
      topic,
      service: pkg.service,
      amount,
    });

    // Payment: create the Mayar hosted-checkout invoice. Best-effort — the
    // booking row is already recorded and the status page self-heals a missing
    // invoice, so a Mayar outage must not fail the request. The Calendar event
    // + Meet invite are created after payment (konsultasi-payment-confirm).
    let paymentUrl: string | null = null;
    if (isMayarConfigured()) {
      try {
        const origin = new URL(request.url).origin;
        const expiredAt =
          paymentDeadline(now.toISOString(), date, timeSlot) ??
          new Date(now.getTime() + PAYMENT_WINDOW_MS);
        const invoice = await createInvoice({
          bookingId,
          name,
          email,
          mobile: phone ?? '',
          serviceLabel: pkg.service,
          amount,
          expiredAt,
          statusUrl: `${origin}/konsultasi/booking/status/${bookingId}`,
        });
        await setInvoiceId(bookingId, invoice.id);
        paymentUrl = invoice.link ?? null;
      } catch (error) {
        console.error('Mayar invoice creation failed (status page will self-heal):', error);
      }
    }

    return NextResponse.json({ success: true, bookingId, paymentUrl });
  } catch (error) {
    console.error('Konsultasi booking error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
```

Removed vs. the old version: the `createBookingEvent` import and call, and `meetLink`/`eventLink` in the response.

- [ ] **Step 2: Verify types + existing tests**

Run: `npx tsc --noEmit && npm run test`
Expected: no type errors; all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/konsultasi/book/route.ts
git commit -m "feat(konsultasi): book route creates Mayar invoice; calendar moves to paid-time"
```

---

### Task 6: Webhook route

**Files:**
- Create: `src/app/api/konsultasi/payment/webhook/route.ts`
- Test: `src/app/api/konsultasi/payment/webhook/route.test.ts`

**Interfaces:**
- Consumes: Task 4 (`confirmPayment`, `reconcileAllPending`); env `MAYAR_WEBHOOK_TOKEN`.
- Produces: `POST /api/konsultasi/payment/webhook?token=…` — registered in the Mayar dashboard (Task 12).

- [ ] **Step 1: Write the failing test**

```ts
// src/app/api/konsultasi/payment/webhook/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const confirmPayment = vi.fn();
const reconcileAllPending = vi.fn();
vi.mock('@/lib/konsultasi-payment-confirm', () => ({
  confirmPayment: (...a: unknown[]) => confirmPayment(...a),
  reconcileAllPending: (...a: unknown[]) => reconcileAllPending(...a),
}));

import { POST } from './route';

const URL_OK = 'https://site.com/api/konsultasi/payment/webhook?token=secret';

function post(url: string, body: unknown) {
  return POST(
    new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.MAYAR_WEBHOOK_TOKEN = 'secret';
});

describe('POST /api/konsultasi/payment/webhook', () => {
  it('404s on a wrong or missing token', async () => {
    expect((await post('https://site.com/api/konsultasi/payment/webhook?token=nope', {})).status).toBe(404);
    expect((await post('https://site.com/api/konsultasi/payment/webhook', {})).status).toBe(404);
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it('404s when the server has no token configured (fail closed)', async () => {
    delete process.env.MAYAR_WEBHOOK_TOKEN;
    expect((await post(URL_OK, {})).status).toBe(404);
  });

  it('acks non-payment events without processing', async () => {
    const res = await post(URL_OK, { event: 'payment.reminder', data: {} });
    expect(res.status).toBe(200);
    expect(confirmPayment).not.toHaveBeenCalled();
    expect(reconcileAllPending).not.toHaveBeenCalled();
  });

  it('confirms the booking from extraData.bookingId', async () => {
    confirmPayment.mockResolvedValue(true);
    const res = await post(URL_OK, {
      event: 'payment.received',
      data: { extraData: { bookingId: 'KB-ABC123' } },
    });
    expect(res.status).toBe(200);
    expect(confirmPayment).toHaveBeenCalledWith('KB-ABC123');
  });

  it('falls back to reconciling all pending when no bookingId is present', async () => {
    const res = await post(URL_OK, { event: 'payment.received', data: { id: 'txn-1' } });
    expect(res.status).toBe(200);
    expect(reconcileAllPending).toHaveBeenCalled();
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it('still acks 200 when processing throws (Mayar retries are undocumented)', async () => {
    confirmPayment.mockRejectedValue(new Error('boom'));
    const res = await post(URL_OK, {
      event: 'payment.received',
      data: { extraData: { bookingId: 'KB-ABC123' } },
    });
    expect(res.status).toBe(200);
  });

  it('acks a malformed (non-JSON) body', async () => {
    const res = await POST(new Request(URL_OK, { method: 'POST', body: 'not-json' }));
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/konsultasi/payment/webhook/route.test.ts`
Expected: FAIL — cannot resolve `./route`.

Note: vitest's `include` is `src/**/*.test.ts`, so this test file is picked up automatically.

- [ ] **Step 3: Write the implementation**

```ts
// src/app/api/konsultasi/payment/webhook/route.ts
import { NextResponse } from 'next/server';
import { confirmPayment, reconcileAllPending } from '@/lib/konsultasi-payment-confirm';

export const dynamic = 'force-dynamic';

/**
 * Mayar webhook receiver (event: payment.received). Mayar webhooks carry no
 * signature, so this handler treats the payload as a hint only: the shared
 * token gates the route, and payment truth always comes from re-fetching the
 * invoice inside confirmPayment().
 */
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  const expected = process.env.MAYAR_WEBHOOK_TOKEN;
  if (!expected || token !== expected) {
    // 404 (not 401) so URL probing can't distinguish this from a missing route.
    return NextResponse.json({ success: false }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    event?: string;
    data?: { extraData?: { bookingId?: unknown } };
  } | null;

  // Ack everything that isn't a payment (payment.reminder, membership.*, …).
  if (body?.event !== 'payment.received') return NextResponse.json({ success: true });

  const bookingId = body.data?.extraData?.bookingId;
  try {
    if (typeof bookingId === 'string' && /^KB-[A-Z0-9]+$/.test(bookingId)) {
      await confirmPayment(bookingId);
    } else {
      // Payload shape drifted — reconcile recent pending bookings instead.
      await reconcileAllPending();
    }
  } catch (error) {
    // Always 200: Mayar's retry behavior is undocumented; status-page polling
    // is the safety net for anything missed here.
    console.error('Mayar webhook processing error (acked):', error);
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/konsultasi/payment/webhook/route.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/konsultasi/payment/webhook/
git commit -m "feat(konsultasi): token-gated Mayar webhook receiver"
```

---

### Task 7: Public status endpoint

**Files:**
- Create: `src/app/api/konsultasi/payment/status/[bookingId]/route.ts`
- Test: `src/app/api/konsultasi/payment/status/[bookingId]/route.test.ts`

**Interfaces:**
- Consumes: Task 4 (`reconcileBookingStatus`).
- Produces: `GET /api/konsultasi/payment/status/{bookingId}` → `{ success: true, status, paymentUrl, meetLink, service, date, time, amount }` — consumed by the status page (Task 9). Unauthenticated by design (same capability model as the old proof-upload route); returns no name/email/phone because booking ids are guessable timestamps.

- [ ] **Step 1: Write the failing test**

```ts
// src/app/api/konsultasi/payment/status/[bookingId]/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const reconcileBookingStatus = vi.fn();
vi.mock('@/lib/konsultasi-payment-confirm', () => ({
  reconcileBookingStatus: (...a: unknown[]) => reconcileBookingStatus(...a),
}));

import { GET } from './route';

function get(bookingId: string) {
  return GET(new Request(`https://site.com/api/konsultasi/payment/status/${bookingId}`), {
    params: Promise.resolve({ bookingId }),
  });
}

beforeEach(() => vi.clearAllMocks());

describe('GET /api/konsultasi/payment/status/[bookingId]', () => {
  it('400s on a malformed booking id without touching the store', async () => {
    expect((await get('DROP TABLE')).status).toBe(400);
    expect(reconcileBookingStatus).not.toHaveBeenCalled();
  });

  it('404s when the booking does not exist', async () => {
    reconcileBookingStatus.mockResolvedValue(null);
    expect((await get('KB-NOPE')).status).toBe(404);
  });

  it('returns the reconciled status payload with the request origin', async () => {
    reconcileBookingStatus.mockResolvedValue({
      status: 'pending_payment', paymentUrl: 'https://x.myr.id/invoices/abc', meetLink: null,
      service: 'Konsultasi Keuangan — Paket Starter', date: '2099-01-01', time: '10:00', amount: '500000',
    });
    const res = await get('KB-ABC123');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.status).toBe('pending_payment');
    expect(json.paymentUrl).toBe('https://x.myr.id/invoices/abc');
    expect(reconcileBookingStatus).toHaveBeenCalledWith('KB-ABC123', 'https://site.com');
  });

  it('500s when reconciliation throws', async () => {
    reconcileBookingStatus.mockRejectedValue(new Error('sheets down'));
    expect((await get('KB-ABC123')).status).toBe(500);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "src/app/api/konsultasi/payment/status/[bookingId]/route.test.ts"`
Expected: FAIL — cannot resolve `./route`.

- [ ] **Step 3: Write the implementation**

```ts
// src/app/api/konsultasi/payment/status/[bookingId]/route.ts
import { NextResponse } from 'next/server';
import { reconcileBookingStatus } from '@/lib/konsultasi-payment-confirm';

export const dynamic = 'force-dynamic';

/**
 * Public booking-status endpoint polled by /konsultasi/booking/status/[bookingId].
 * The bookingId acts as the capability (same model as the proof-upload route);
 * the payload deliberately excludes name/email/phone.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;
  if (!/^KB-[A-Z0-9]+$/.test(bookingId)) {
    return NextResponse.json({ success: false, message: 'Invalid booking id' }, { status: 400 });
  }
  try {
    const origin = new URL(request.url).origin;
    const result = await reconcileBookingStatus(bookingId, origin);
    if (!result) {
      return NextResponse.json({ success: false, message: 'Booking tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Konsultasi booking status error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "src/app/api/konsultasi/payment/status/[bookingId]/route.test.ts"`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/konsultasi/payment/status/"
git commit -m "feat(konsultasi): public self-healing booking-status endpoint"
```

---

### Task 8: Translations (ID + EN)

**Files:**
- Modify: `src/lib/translations.ts` (Indonesian `konsultasi.booking` at ~line 211; English at ~line 589)

**Interfaces:**
- Produces keys consumed by Tasks 9–10: `konsultasi.booking.payment.*`, `konsultasi.booking.status.*`, updated `confirm.note`/`confirm.submit`, updated `success.whatsapp`; removes `success.uploadTitle|uploadHint|uploadCta|uploading|uploadDone` (their only consumer is deleted in Task 10 — do Tasks 8–10 in order and typecheck at the end of Task 10).

- [ ] **Step 1: Indonesian branch** — inside `konsultasi.booking` (~line 211):

Replace `confirm.note` and `confirm.submit`:

```ts
          note: 'Setelah konfirmasi, kamu akan diarahkan ke halaman pembayaran aman (Mayar). Selesaikan pembayaran dalam 1 jam — lewat dari itu, slot otomatis dilepas.',
          submit: 'Konfirmasi & Bayar',
```

Replace the whole `success` object with (drops the five `upload*` keys, updates `body` and `whatsapp`):

```ts
        success: {
          title: 'Booking diterima!',
          body: 'Booking-mu sudah kami catat. Setelah pembayaran diterima, undangan Google Meet dikirim ke emailmu.',
          refId: 'Nomor Referensi',
          summaryTitle: 'Ringkasan Booking',
          joinMeet: 'Gabung Google Meet',
          meetNote: 'Undangan Google Calendar beserta link Google Meet sudah dikirim ke emailmu.',
          waIntro: 'Halo, saya sudah booking konsultasi:',
          whatsapp: 'Hubungi via WhatsApp',
        },
```

Add two new objects right after `success` (before `next: 'Lanjut',`):

```ts
        payment: {
          createdTitle: 'Booking dibuat!',
          createdBody: 'Kamu akan diarahkan ke halaman pembayaran dalam beberapa detik…',
          saveLink: 'Simpan link ini untuk cek status booking-mu kapan saja:',
          payNow: 'Bayar Sekarang',
          toStatus: 'Lihat Status Booking',
          noPayUrl: 'Halaman pembayaran belum bisa dibuat. Buka halaman status untuk melanjutkan pembayaran.',
        },
        status: {
          title: 'Status Booking',
          pendingTitle: 'Menunggu Pembayaran',
          pendingBody: 'Selesaikan pembayaranmu sebelum batas waktu (1 jam sejak booking). Halaman ini diperbarui otomatis setelah pembayaran diterima.',
          paidTitle: 'Pembayaran Diterima',
          paidBody: 'Undangan Google Calendar beserta link Google Meet sudah dikirim ke emailmu.',
          meetPending: 'Undangan Google Meet akan dikirim ke emailmu sebentar lagi.',
          expiredTitle: 'Waktu Pembayaran Habis',
          expiredBody: 'Slot booking sudah dilepas. Silakan buat booking baru.',
          rebook: 'Booking Ulang',
          cancelledTitle: 'Booking Dibatalkan',
          cancelledBody: 'Booking ini sudah dibatalkan. Hubungi kami jika ada pertanyaan.',
          refundedTitle: 'Dana Dikembalikan',
          refundedBody: 'Booking ini sudah direfund. Hubungi kami jika ada pertanyaan.',
          checkStatus: 'Cek Status',
          notFound: 'Booking tidak ditemukan.',
          loadError: 'Gagal memuat status. Coba lagi.',
        },
```

- [ ] **Step 2: English branch** — same edits inside the EN `konsultasi.booking` (~line 589):

```ts
          note: 'After confirming, you will be redirected to a secure payment page (Mayar). Complete payment within 1 hour — after that, the slot is automatically released.',
          submit: 'Confirm & Pay',
```

```ts
        success: {
          title: 'Booking received!',
          body: 'Your booking has been recorded. Once payment is received, a Google Meet invite will be sent to your email.',
          refId: 'Reference Number',
          summaryTitle: 'Booking Summary',
          joinMeet: 'Join Google Meet',
          meetNote: 'A Google Calendar invite with the Google Meet link has been sent to your email.',
          waIntro: 'Hi, I just booked a consultation:',
          whatsapp: 'Contact via WhatsApp',
        },
        payment: {
          createdTitle: 'Booking created!',
          createdBody: 'You will be redirected to the payment page in a few seconds…',
          saveLink: 'Save this link to check your booking status anytime:',
          payNow: 'Pay Now',
          toStatus: 'View Booking Status',
          noPayUrl: 'The payment page could not be created yet. Open the status page to continue your payment.',
        },
        status: {
          title: 'Booking Status',
          pendingTitle: 'Awaiting Payment',
          pendingBody: 'Complete your payment before the deadline (1 hour after booking). This page updates automatically once payment is received.',
          paidTitle: 'Payment Received',
          paidBody: 'A Google Calendar invite with the Google Meet link has been sent to your email.',
          meetPending: 'Your Google Meet invite will be sent to your email shortly.',
          expiredTitle: 'Payment Window Expired',
          expiredBody: 'The booking slot has been released. Please make a new booking.',
          rebook: 'Book Again',
          cancelledTitle: 'Booking Cancelled',
          cancelledBody: 'This booking has been cancelled. Contact us if you have any questions.',
          refundedTitle: 'Refunded',
          refundedBody: 'This booking has been refunded. Contact us if you have any questions.',
          checkStatus: 'Check Status',
          notFound: 'Booking not found.',
          loadError: 'Failed to load status. Try again.',
        },
```

- [ ] **Step 3: Commit** (typecheck is deferred to Task 10 — `BookingFlow.tsx` still references the removed `upload*` keys until then; commit both langs together)

```bash
git add src/lib/translations.ts
git commit -m "feat(konsultasi): payment + status-page strings (ID/EN); drop proof-upload strings"
```

---

### Task 9: Booking status page

**Files:**
- Create: `src/app/konsultasi/booking/status/[bookingId]/page.tsx`
- Create: `src/app/konsultasi/booking/status/[bookingId]/StatusClient.tsx`

**Interfaces:**
- Consumes: Task 7 endpoint; Task 8 strings; existing `getPaymentDisplay()` (`src/lib/konsultasi-payment.ts`, returns `{ whatsappUrl: string, ... }`), `Container`, `useLang`, `formatIDR`.
- Produces: public page `/konsultasi/booking/status/{bookingId}` — the redirect target for interstitial + Mayar invoice description.

- [ ] **Step 1: Server page**

```tsx
// src/app/konsultasi/booking/status/[bookingId]/page.tsx
import React from 'react';
import { Metadata } from 'next';
import StatusClient from './StatusClient';
import { getPaymentDisplay } from '@/lib/konsultasi-payment';

export const metadata: Metadata = {
  title: 'Status Booking Konsultasi',
  description: 'Cek status pembayaran dan jadwal sesi konsultasi keuanganmu.',
};

export const dynamic = 'force-dynamic';

export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return (
    <main className="bg-[#F0F7FA] min-h-screen pt-32 pb-20">
      <StatusClient bookingId={bookingId} payment={getPaymentDisplay()} />
    </main>
  );
}
```

- [ ] **Step 2: Client component**

```tsx
// src/app/konsultasi/booking/status/[bookingId]/StatusClient.tsx
'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';
import { formatIDR } from '@/lib/konsultasi-packages';
import type { PaymentDisplay } from '@/lib/konsultasi-payment';

type StatusPayload = {
  success: boolean;
  status: string;
  paymentUrl: string | null;
  meetLink: string | null;
  service: string;
  date: string | null;
  time: string | null;
  amount: string;
};

const POLL_MS = 5000;
const MAX_POLLS = 180; // ~15 minutes of auto-polling, then manual "Cek Status".

export default function StatusClient({
  bookingId,
  payment,
}: {
  bookingId: string;
  payment: PaymentDisplay;
}) {
  const { lang } = useLang();
  const t = translations[lang].konsultasi.booking;
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const polls = useRef(0);

  const fmtDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/konsultasi/payment/status/${bookingId}`, { cache: 'no-store' });
      if (res.status === 400 || res.status === 404) {
        setData(null);
        setError(t.status.notFound);
        return;
      }
      const json = (await res.json()) as StatusPayload;
      if (!res.ok || !json.success) throw new Error();
      setData(json);
    } catch {
      setError(t.status.loadError);
    } finally {
      setLoading(false);
    }
  }, [bookingId, t.status.notFound, t.status.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-poll while payment is pending.
  useEffect(() => {
    if (data?.status !== 'pending_payment') return;
    const id = setInterval(() => {
      polls.current += 1;
      if (polls.current > MAX_POLLS) {
        clearInterval(id);
        return;
      }
      load();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [data?.status, load]);

  const card = 'max-w-2xl mx-auto bg-white rounded-2xl border border-[#E0EBF5] p-8';

  if (loading) {
    return (
      <Container>
        <div className={`${card} flex items-center justify-center gap-3 text-[#666666]`}>
          <Loader2 className="w-5 h-5 animate-spin" />
          {t.status.title}…
        </div>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <div className={`${card} text-center`}>
          <h1 className="text-2xl font-extrabold text-[#1A1918] mb-3">{t.status.title}</h1>
          <p className="text-[#8C1C00] mb-6">{error ?? t.status.notFound}</p>
          <Link href="/konsultasi/booking" className="inline-flex rounded-full bg-[#205781] px-6 py-3 font-semibold text-white">
            {t.status.rebook}
          </Link>
        </div>
      </Container>
    );
  }

  const paid = data.status === 'paid';
  const pending = data.status === 'pending_payment';
  const expired = data.status === 'expired';
  const heading = paid
    ? t.status.paidTitle
    : pending
      ? t.status.pendingTitle
      : expired
        ? t.status.expiredTitle
        : data.status === 'refunded'
          ? t.status.refundedTitle
          : t.status.cancelledTitle;
  const body = paid
    ? t.status.paidBody
    : pending
      ? t.status.pendingBody
      : expired
        ? t.status.expiredBody
        : data.status === 'refunded'
          ? t.status.refundedBody
          : t.status.cancelledBody;

  const waMessage = [
    t.success.waIntro,
    `${t.confirm.summaryPackage}: ${data.service}`,
    ...(data.date ? [`${t.confirm.summaryDate}: ${fmtDate(data.date)}`] : []),
    ...(data.time ? [`${t.confirm.summaryTime}: ${data.time} WIB`] : []),
    ...(data.meetLink ? [`Google Meet: ${data.meetLink}`] : []),
    `${t.success.refId}: ${bookingId}`,
  ].join('\n');
  const waHref = `${payment.whatsappUrl.split('?')[0]}?text=${encodeURIComponent(waMessage)}`;

  return (
    <Container>
      <div className={card}>
        {paid ? (
          <p className="inline-flex items-center gap-2 text-[#1B7A3F] font-extrabold text-2xl mb-2">
            <Check className="w-6 h-6" />
            {heading}
          </p>
        ) : (
          <h1 className={`text-2xl font-extrabold mb-2 ${expired ? 'text-[#8C1C00]' : 'text-[#1A1918]'}`}>{heading}</h1>
        )}
        <p className="text-[#666666] mb-4">{body}</p>
        <p className="text-[13px] text-[#666666] mb-6">
          {t.success.refId}: <span className="font-mono font-bold text-[#205781]">{bookingId}</span>
        </p>

        <div className="bg-[#F5F8FC] border border-[#E0EBF5] rounded-2xl p-5 mb-6">
          <p className="font-semibold text-[#1A1918] mb-3">{t.success.summaryTitle}</p>
          <dl className="flex flex-col gap-2 text-[14px]">
            <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryPackage}</dt><dd className="font-semibold text-[#1A1918] text-right">{data.service}</dd></div>
            {data.date && (
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryDate}</dt><dd className="font-semibold text-[#1A1918]">{fmtDate(data.date)}</dd></div>
            )}
            {data.time && (
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryTime}</dt><dd className="font-semibold text-[#1A1918]">{data.time} WIB</dd></div>
            )}
            <div className="flex justify-between pt-2 mt-1 border-t border-[#E0EBF5]"><dt className="font-bold text-[#1A1918]">{t.confirm.total}</dt><dd className="font-extrabold text-[#205781]">{formatIDR(Number(data.amount) || 0)}</dd></div>
          </dl>
        </div>

        {pending && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {data.paymentUrl && (
              <a href={data.paymentUrl} className="inline-flex rounded-full bg-[#f79d35] px-6 py-3 font-semibold text-white shadow-[0_8px_20px_rgba(247,157,53,0.35)]">
                {t.payment.payNow}
              </a>
            )}
            <button type="button" onClick={load} className="inline-flex rounded-full border border-[#205781] px-6 py-3 font-semibold text-[#205781]">
              {t.status.checkStatus}
            </button>
          </div>
        )}

        {paid && (
          <>
            {data.meetLink ? (
              <p className="text-[13px] text-[#666666] mb-5">
                {t.success.meetNote}{' '}
                <a href={data.meetLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#4F9DA6] underline">
                  {t.success.joinMeet}
                </a>
              </p>
            ) : (
              <p className="text-[13px] text-[#666666] mb-5">{t.status.meetPending}</p>
            )}
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-[#f79d35] px-6 py-3 font-semibold text-white shadow-[0_8px_20px_rgba(247,157,53,0.35)]">
              {t.success.whatsapp}
            </a>
          </>
        )}

        {expired && (
          <Link href="/konsultasi/booking" className="inline-flex rounded-full bg-[#205781] px-6 py-3 font-semibold text-white">
            {t.status.rebook}
          </Link>
        )}
      </div>
    </Container>
  );
}
```

- [ ] **Step 3: Verify it compiles** (full typecheck still fails on BookingFlow's removed keys until Task 10 — check only that this page has no *new* errors)

Run: `npx tsc --noEmit 2>&1 | grep -v BookingFlow`
Expected: no errors from `status/[bookingId]/*`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/konsultasi/booking/status/"
git commit -m "feat(konsultasi): revisitable booking status page with payment polling"
```

---

### Task 10: BookingFlow — interstitial + redirect, remove proof upload

**Files:**
- Modify: `src/app/konsultasi/booking/BookingFlow.tsx`

**Interfaces:**
- Consumes: Task 5 response `{ success, bookingId, paymentUrl }`; Task 8 `payment.*` strings.
- Produces: after submit, an interstitial that shows the status link and auto-redirects to Mayar in ~3 s (or to the status page when `paymentUrl` is null).

- [ ] **Step 1: Update state + submit + effects**

In `src/app/konsultasi/booking/BookingFlow.tsx`:

1a. Change the React import to include `useEffect`:

```tsx
import React, { useEffect, useMemo, useState } from 'react';
```

1b. Delete these five state lines and the whole `uploadProof` function (lines 31, 34–36, 46–62 in the current file):

```tsx
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [proofDone, setProofDone] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
```

and add in their place:

```tsx
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
```

1c. Add the auto-redirect effect right after the state declarations:

```tsx
  // After booking success: give the customer a beat to see/save the status
  // link, then hand off to the Mayar hosted checkout (or the status page when
  // invoice creation failed — it self-heals there).
  useEffect(() => {
    if (!bookingId) return;
    const target = paymentUrl ?? `/konsultasi/booking/status/${bookingId}`;
    const id = setTimeout(() => window.location.assign(target), 3000);
    return () => clearTimeout(id);
  }, [bookingId, paymentUrl]);
```

1d. In `submit`, replace:

```tsx
      setMeetLink(data.meetLink ?? null);
      setBookingId(data.bookingId);
```

with:

```tsx
      setPaymentUrl(data.paymentUrl ?? null);
      setBookingId(data.bookingId);
```

- [ ] **Step 2: Replace the success screen with the interstitial**

Replace the entire `if (bookingId) { … }` block (the old success screen with WhatsApp + proof upload, lines 84–139) with:

```tsx
  if (bookingId) {
    const statusPath = `/konsultasi/booking/status/${bookingId}`;
    return (
      <Container>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E0EBF5] p-8 text-center">
          <h1 className="text-2xl font-extrabold text-[#1A1918] mb-2">{t.payment.createdTitle}</h1>
          <p className="text-[13px] text-[#666666] mb-4">
            {t.success.refId}: <span className="font-mono font-bold text-[#205781]">{bookingId}</span>
          </p>
          <p className="text-[#666666] mb-5">
            {paymentUrl ? t.payment.createdBody : t.payment.noPayUrl}
          </p>

          <div className="bg-[#F5F8FC] border border-[#E0EBF5] rounded-2xl p-5 mb-6 text-left">
            <p className="text-[13px] font-semibold text-[#3A5A70] mb-1">{t.payment.saveLink}</p>
            <Link href={statusPath} className="font-mono text-[13px] text-[#205781] underline break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}${statusPath}` : statusPath}
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {paymentUrl && (
              <a href={paymentUrl} className="inline-flex rounded-full bg-[#f79d35] px-7 py-3 font-semibold text-white shadow-[0_8px_20px_rgba(247,157,53,0.35)]">
                {t.payment.payNow}
              </a>
            )}
            <Link href={statusPath} className="inline-flex rounded-full border border-[#205781] px-6 py-3 font-semibold text-[#205781]">
              {t.payment.toStatus}
            </Link>
          </div>
        </div>
      </Container>
    );
  }
```

- [ ] **Step 3: Full typecheck + lint + tests** (this closes the loop opened in Task 8)

Run: `npx tsc --noEmit && npm run lint && npm run test`
Expected: all clean. If `Check` is now reported unused, keep it — it is still used in the schedule step's feature list; if `lucide-react` imports genuinely became unused, remove only the unused ones.

- [ ] **Step 4: Commit**

```bash
git add src/app/konsultasi/booking/BookingFlow.tsx
git commit -m "feat(konsultasi): interstitial + auto-redirect to Mayar checkout; drop proof-upload UI"
```

---

### Task 11: Admin — `expired` status

**Files:**
- Modify: `src/app/api/admin/bookings/[id]/route.ts:6`
- Modify: `src/app/admin/bookings/BookingsTable.tsx:7-19`

**Interfaces:**
- Consumes: existing admin PATCH flow.
- Produces: admins can see and set `expired` (system also sets it via Task 4).

- [ ] **Step 1: Extend the PATCH enum**

In `src/app/api/admin/bookings/[id]/route.ts`, change:

```ts
export const ADMIN_BOOKING_STATUSES = ['pending_payment', 'paid', 'cancelled', 'refunded'] as const;
```

to:

```ts
export const ADMIN_BOOKING_STATUSES = ['pending_payment', 'paid', 'cancelled', 'refunded', 'expired'] as const;
```

- [ ] **Step 2: Extend the dropdown + style map**

In `src/app/admin/bookings/BookingsTable.tsx`, change `STATUS_OPTIONS` and `STATUS_STYLE` to:

```tsx
const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Menunggu Bayar' },
  { value: 'paid', label: 'Lunas' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'refunded', label: 'Dikembalikan' },
  { value: 'expired', label: 'Kedaluwarsa' },
] as const;

const STATUS_STYLE: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-800 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  refunded: 'bg-gray-100 text-gray-600 border-gray-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
};
```

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit`
Expected: clean.

```bash
git add "src/app/api/admin/bookings/[id]/route.ts" src/app/admin/bookings/BookingsTable.tsx
git commit -m "feat(admin): expired booking status in dashboard + PATCH enum"
```

---

### Task 12: Setup docs + final verification

**Files:**
- Create: `docs/mayar-setup.md`

**Interfaces:** none (documentation + verification).

- [ ] **Step 1: Write the setup doc**

```markdown
<!-- docs/mayar-setup.md -->
# Mayar.id Setup — Konsultasi Payments

## Environment variables (.env.local / Vercel)

| Var | Value |
|---|---|
| `MAYAR_API_KEY` | Mayar dashboard → API Keys → generate a **Read & Write** key. Sandbox (mayar.club) and production (mayar.id) use **separate keys**. |
| `MAYAR_BASE_URL` | Development: `https://api.mayar.club/hl/v2` · Production: `https://api.mayar.id/hl/v2` |
| `MAYAR_WEBHOOK_TOKEN` | Long random string, e.g. `openssl rand -hex 32`. Shared secret in the webhook URL. |

## Mayar dashboard steps (manual, once per environment)

1. Generate the API key (above).
2. Register the webhook: **Integration → Webhook** →
   `https://<domain>/api/konsultasi/payment/webhook?token=<MAYAR_WEBHOOK_TOKEN>`
3. Decide the fee-bearing setting (admin/channel fee borne by customer vs merchant)
   under payment/checkout settings.
4. Use **Test URL Hook** on the webhook page to send a test event and confirm a
   200 response in the deployment logs.

## Go-live checklist

1. Deploy with sandbox values; run a full booking → sandbox payment → sheet flips
   to `paid` → Calendar event created → status page shows the Meet link.
2. Negative paths: let an invoice expire (slot released ≤ 1h), hit the webhook with a
   wrong token (404), book while `MAYAR_API_KEY` is unset (status page self-heals).
3. Swap `MAYAR_BASE_URL` + production API key, register the production webhook.
4. Live test with the cheapest package, then refund it from the Mayar dashboard and
   mark the booking `refunded` in the admin dashboard.
```

- [ ] **Step 2: Full verification**

Run: `npm run lint && npx tsc --noEmit && npm run test && npm run build`
Expected: all pass, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add docs/mayar-setup.md
git commit -m "docs: Mayar setup + go-live checklist"
```

- [ ] **Step 4: Sandbox smoke test (manual, with the owner)**

1. Add the three `MAYAR_*` vars to `.env.local` (sandbox values).
2. `npm run dev`, book a slot, confirm redirect to `api.mayar.club` hosted page.
3. Pay with a sandbox method; confirm the sheet row flips to `paid`, column H has the
   invoice id, column O gets the Meet link, and the status page shows "Pembayaran Diterima".
```
