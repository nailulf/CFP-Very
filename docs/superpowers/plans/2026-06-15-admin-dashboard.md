# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a consolidated `/admin` portal (reusing the invoice login) to edit package prices + sale prices, edit booking availability rules + blackout dates, and view/manage bookings — and move the existing invoice tool under `/admin/invoice`.

**Architecture:** Editable settings move out of hardcoded TS constants into a `Settings` tab in the existing Google Sheet. A pure config module (`settings-config.ts`) holds defaults, merge, and validation logic (unit-tested); a server-only store (`settings-store.ts`) does the Sheet I/O with a 60s in-memory cache and fail-open fallback to defaults. The booking page and book API read merged values from the store so the charged amount (`salePrice ?? price`) stays server-authoritative. New `/admin/*` pages and `/api/admin/*` routes are guarded by the existing `getInvoiceSession()`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Zod 4, Vitest, Google Sheets API, Lucide icons.

---

## File Structure

**Create:**
- `src/lib/settings-config.ts` — pure: defaults, types, Zod schemas, merge + resolve functions
- `src/lib/settings-config.test.ts` — unit tests for the pure module
- `src/lib/settings-store.ts` — server-only: Sheet-backed getters/setters + cache (fail-open)
- `src/lib/settings-store.test.ts` — mocked tests for store read/write/cache
- `src/app/admin/login/page.tsx` + `LoginForm.tsx` — unified admin login
- `src/app/admin/page.tsx` — admin hub
- `src/app/admin/packages/page.tsx` + `PackagesForm.tsx` — pricing editor
- `src/app/admin/availability/page.tsx` + `AvailabilityForm.tsx` — availability editor
- `src/app/admin/bookings/page.tsx` + `BookingsTable.tsx` — bookings list + status
- `src/app/admin/invoice/**` — moved invoice tool pages
- `src/app/api/admin/settings/packages/route.ts` — GET/PUT pricing
- `src/app/api/admin/settings/availability/route.ts` — GET/PUT availability
- `src/app/api/admin/bookings/route.ts` — GET list
- `src/app/api/admin/bookings/[id]/route.ts` — PATCH status

**Modify:**
- `src/lib/google-sheets.ts` — add `ensureSheetTab()`
- `src/lib/konsultasi-store.ts` — add `listBookings()`, `updateBookingStatus()`, export `Booking`
- `src/app/konsultasi/booking/page.tsx` — read availability + pricing from store
- `src/app/konsultasi/booking/BookingFlow.tsx` — take `pricing` prop, render strikethrough
- `src/app/api/konsultasi/book/route.ts` — read availability + pricing from store
- `src/app/api/invoice-auth/login/route.ts` — unchanged logic (kept; referenced)
- `next.config.ts` — redirect old `/generate-invoice/*` → `/admin/invoice/*`

**Delete (moved):**
- `src/app/generate-invoice/**` (after move to `src/app/admin/invoice/**` + login to `src/app/admin/login`)

---

## Task 1: Pure settings-config module

**Files:**
- Create: `src/lib/settings-config.ts`
- Test: `src/lib/settings-config.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/settings-config.test.ts
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PRICING,
  mergePricing,
  resolveAmount,
  mergeAvailability,
  pricingSchema,
  availabilitySchema,
} from './settings-config';
import { BOOKING_AVAILABILITY } from './booking-availability';

describe('mergePricing', () => {
  it('returns defaults when override is null', () => {
    expect(mergePricing(null)).toEqual(DEFAULT_PRICING);
    expect(DEFAULT_PRICING.starter).toEqual({ price: 500_000, salePrice: null });
  });

  it('overrides only the given ids and keeps the rest at defaults', () => {
    const merged = mergePricing({ starter: { price: 600_000, salePrice: 450_000 } });
    expect(merged.starter).toEqual({ price: 600_000, salePrice: 450_000 });
    expect(merged.family).toEqual(DEFAULT_PRICING.family);
  });

  it('ignores unknown package ids', () => {
    const merged = mergePricing({ bogus: { price: 1, salePrice: null } } as never);
    expect(merged).toEqual(DEFAULT_PRICING);
  });

  it('coerces a missing salePrice to null', () => {
    const merged = mergePricing({ family: { price: 999_000 } } as never);
    expect(merged.family).toEqual({ price: 999_000, salePrice: null });
  });
});

describe('resolveAmount', () => {
  it('uses salePrice when set, else price', () => {
    expect(resolveAmount({ price: 500_000, salePrice: 400_000 })).toBe(400_000);
    expect(resolveAmount({ price: 500_000, salePrice: null })).toBe(500_000);
  });
});

describe('mergeAvailability', () => {
  it('returns the default config when override is null', () => {
    expect(mergeAvailability(null)).toEqual(BOOKING_AVAILABILITY);
  });

  it('overrides given fields and always pins timezone', () => {
    const merged = mergeAvailability({ enabled: false, startHour: 10, timezone: 'X' } as never);
    expect(merged.enabled).toBe(false);
    expect(merged.startHour).toBe(10);
    expect(merged.timezone).toBe('Asia/Jakarta');
    expect(merged.endHour).toBe(BOOKING_AVAILABILITY.endHour);
  });
});

describe('schemas', () => {
  it('rejects a salePrice >= price', () => {
    expect(pricingSchema.safeParse({ starter: { price: 100, salePrice: 100 } }).success).toBe(false);
  });
  it('accepts a null salePrice', () => {
    expect(pricingSchema.safeParse({ starter: { price: 100, salePrice: null } }).success).toBe(true);
  });
  it('rejects availability with startHour >= endHour', () => {
    const bad = { ...BOOKING_AVAILABILITY, startHour: 15, endHour: 9 };
    expect(availabilitySchema.safeParse(bad).success).toBe(false);
  });
  it('rejects a weekday outside 0..6', () => {
    const bad = { ...BOOKING_AVAILABILITY, weekdays: [7] };
    expect(availabilitySchema.safeParse(bad).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/settings-config.test.ts`
Expected: FAIL — `Cannot find module './settings-config'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/settings-config.ts
// Pure (no I/O): defaults, validation, and merge logic for admin-editable settings.
import { z } from 'zod';
import {
  KONSULTASI_PACKAGES,
  KONSULTASI_PACKAGE_IDS,
  type KonsultasiPackageId,
} from './konsultasi-packages';
import { BOOKING_AVAILABILITY, type BookingAvailability } from './booking-availability';

export type PackagePrice = { price: number; salePrice: number | null };
export type PackagePricing = Record<KonsultasiPackageId, PackagePrice>;

/** Code-defined defaults, derived from the package list. */
export const DEFAULT_PRICING: PackagePricing = Object.fromEntries(
  KONSULTASI_PACKAGES.map((p) => [p.id, { price: p.amount, salePrice: null }]),
) as PackagePricing;

export function resolveAmount(p: PackagePrice): number {
  return p.salePrice ?? p.price;
}

/** Merge a stored override (untrusted JSON) over the defaults; ignore unknown ids. */
export function mergePricing(
  override: Partial<Record<string, Partial<PackagePrice>>> | null | undefined,
): PackagePricing {
  const out = {} as PackagePricing;
  for (const id of KONSULTASI_PACKAGE_IDS) {
    const o = override?.[id];
    out[id] =
      o && typeof o.price === 'number'
        ? { price: o.price, salePrice: typeof o.salePrice === 'number' ? o.salePrice : null }
        : { ...DEFAULT_PRICING[id] };
  }
  return out;
}

/** Merge a stored availability override over the default; timezone is always pinned. */
export function mergeAvailability(
  override: Partial<BookingAvailability> | null | undefined,
): BookingAvailability {
  return { ...BOOKING_AVAILABILITY, ...(override ?? {}), timezone: 'Asia/Jakarta' };
}

// ---- Validation schemas (used by the admin PUT routes) ----

export const packagePriceSchema = z
  .object({
    price: z.number().int().positive(),
    salePrice: z.number().int().positive().nullable(),
  })
  .refine((v) => v.salePrice === null || v.salePrice < v.price, {
    message: 'salePrice must be less than price',
  });

export const pricingSchema = z.record(z.enum(KONSULTASI_PACKAGE_IDS), packagePriceSchema);

export const availabilitySchema = z
  .object({
    enabled: z.boolean(),
    weekdays: z.array(z.number().int().min(0).max(6)),
    startHour: z.number().int().min(0).max(23),
    endHour: z.number().int().min(1).max(24),
    slotMinutes: z.number().int().positive(),
    leadTimeDays: z.number().int().min(0),
    horizonDays: z.number().int().positive(),
    blackoutDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  })
  .refine((v) => v.startHour < v.endHour, {
    message: 'startHour must be before endHour',
  });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/settings-config.test.ts`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/settings-config.ts src/lib/settings-config.test.ts
git commit -m "feat(admin): pure settings-config module (defaults, merge, validation)"
```

---

## Task 2: ensureSheetTab helper

**Files:**
- Modify: `src/lib/google-sheets.ts`

- [ ] **Step 1: Add the helper**

Append this function to `src/lib/google-sheets.ts` (it reuses the existing `getSheetGridId` pattern — note `getSheetGridId` is currently a private function in this file; place `ensureSheetTab` after it):

```ts
/**
 * Create a tab if it does not already exist. No-op when the tab is present.
 * Used so the admin dashboard can self-bootstrap the "Settings" tab.
 */
export async function ensureSheetTab(
  spreadsheetId: string,
  tabName: string
): Promise<void> {
  const token = await getGoogleAccessToken();
  const metaUrl = `${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!metaRes.ok) {
    throw new Error(`Google Sheets metadata failed (${metaRes.status}): ${await metaRes.text()}`);
  }
  const data = (await metaRes.json()) as {
    sheets?: { properties: { title: string } }[];
  };
  if (data.sheets?.some((s) => s.properties.title === tabName)) return;

  const url = `${SHEETS_API}/${spreadsheetId}:batchUpdate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{ addSheet: { properties: { title: tabName } } }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Google Sheets addSheet failed (${res.status}): ${await res.text()}`);
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/google-sheets.ts
git commit -m "feat(sheets): add ensureSheetTab helper"
```

---

## Task 3: Settings store (Sheet-backed, cached, fail-open)

**Files:**
- Create: `src/lib/settings-store.ts`
- Test: `src/lib/settings-store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/settings-store.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const readSheetValues = vi.fn();
const updateSheetRange = vi.fn();
const appendSheetRow = vi.fn();
const ensureSheetTab = vi.fn();

vi.mock('./google-sheets', () => ({
  readSheetValues: (...a: unknown[]) => readSheetValues(...a),
  updateSheetRange: (...a: unknown[]) => updateSheetRange(...a),
  appendSheetRow: (...a: unknown[]) => appendSheetRow(...a),
  ensureSheetTab: (...a: unknown[]) => ensureSheetTab(...a),
}));

import { DEFAULT_PRICING } from './settings-config';

// Imported dynamically inside tests so the module-level cache resets per test via vi.resetModules.
async function freshStore() {
  vi.resetModules();
  return import('./settings-store');
}

describe('settings-store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SHEET_ID = 'sheet-1';
    process.env.GOOGLE_SETTINGS_TAB = 'Settings';
  });

  it('falls back to default pricing when the Sheet read throws', async () => {
    readSheetValues.mockRejectedValue(new Error('tab missing'));
    const store = await freshStore();
    expect(await store.getPackagePricing()).toEqual(DEFAULT_PRICING);
  });

  it('returns merged pricing from a stored row', async () => {
    readSheetValues.mockResolvedValue([
      ['Key', 'Value', 'Updated At', 'Updated By'],
      ['packages', JSON.stringify({ starter: { price: 600000, salePrice: 450000 } }), '', ''],
    ]);
    const store = await freshStore();
    const pricing = await store.getPackagePricing();
    expect(pricing.starter).toEqual({ price: 600000, salePrice: 450000 });
    expect(pricing.family).toEqual(DEFAULT_PRICING.family);
  });

  it('caches reads within the TTL (second call does not re-read)', async () => {
    readSheetValues.mockResolvedValue([['Key', 'Value']]);
    const store = await freshStore();
    await store.getPackagePricing();
    await store.getPackagePricing();
    expect(readSheetValues).toHaveBeenCalledTimes(1);
  });

  it('updates an existing key row and busts the cache', async () => {
    readSheetValues.mockResolvedValue([
      ['Key', 'Value', 'Updated At', 'Updated By'],
      ['packages', '{}', '', ''],
    ]);
    const store = await freshStore();
    await store.savePackagePricing(
      { starter: { price: 700000, salePrice: null }, family: { price: 1000000, salePrice: null }, comprehensive: { price: 2000000, salePrice: null } },
      'admin@x.com',
    );
    expect(ensureSheetTab).toHaveBeenCalledWith('sheet-1', 'Settings');
    // existing 'packages' row is at data index 1 → sheet row 2
    expect(updateSheetRange).toHaveBeenCalledWith(
      'sheet-1',
      'Settings!A2:D2',
      expect.any(Array),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/settings-store.test.ts`
Expected: FAIL — `Cannot find module './settings-store'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/settings-store.ts
import 'server-only';
import { readSheetValues, updateSheetRange, appendSheetRow, ensureSheetTab } from './google-sheets';
import {
  DEFAULT_PRICING,
  mergePricing,
  mergeAvailability,
  type PackagePricing,
} from './settings-config';
import { BOOKING_AVAILABILITY, type BookingAvailability } from './booking-availability';

const CACHE_TTL_MS = 60_000;
const HEADERS = ['Key', 'Value', 'Updated At', 'Updated By'] as const;

function tab(): string {
  return process.env.GOOGLE_SETTINGS_TAB || 'Settings';
}

type CacheEntry<T> = { value: T; at: number };
let pricingCache: CacheEntry<PackagePricing> | null = null;
let availabilityCache: CacheEntry<BookingAvailability> | null = null;

function fresh<T>(c: CacheEntry<T> | null): T | null {
  if (c && Date.now() - c.at < CACHE_TTL_MS) return c.value;
  return null;
}

/** Read a single key's parsed JSON value. Returns null (fail-open) on any error. */
async function readSetting(key: string): Promise<unknown | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return null;
  try {
    const rows = await readSheetValues(sheetId, `${tab()}!A:D`);
    for (let i = 1; i < rows.length; i++) {
      if ((rows[i]?.[0] || '').trim() === key) {
        return JSON.parse(rows[i][1] || 'null');
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function writeSetting(key: string, value: unknown, updatedBy: string): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');
  await ensureSheetTab(sheetId, tab());

  const range = `${tab()}!A:D`;
  let rows: string[][] = [];
  try {
    rows = await readSheetValues(sheetId, range);
  } catch {
    rows = [];
  }

  const record = [key, JSON.stringify(value), new Date().toISOString(), updatedBy];

  if (rows.length === 0) {
    await appendSheetRow(sheetId, range, [...HEADERS]);
    await appendSheetRow(sheetId, range, record);
    return;
  }

  let foundRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i]?.[0] || '').trim() === key) {
      foundRow = i;
      break;
    }
  }
  if (foundRow >= 0) {
    const sheetRow = foundRow + 1; // header is sheet row 1
    await updateSheetRange(sheetId, `${tab()}!A${sheetRow}:D${sheetRow}`, [record]);
  } else {
    await appendSheetRow(sheetId, range, record);
  }
}

export async function getPackagePricing(): Promise<PackagePricing> {
  const cached = fresh(pricingCache);
  if (cached) return cached;
  const raw = await readSetting('packages');
  const value = mergePricing(raw as never);
  pricingCache = { value, at: Date.now() };
  return value;
}

export async function getAvailabilityConfig(): Promise<BookingAvailability> {
  const cached = fresh(availabilityCache);
  if (cached) return cached;
  const raw = await readSetting('availability');
  const value = mergeAvailability(raw as never);
  availabilityCache = { value, at: Date.now() };
  return value;
}

export async function savePackagePricing(value: PackagePricing, updatedBy: string): Promise<void> {
  await writeSetting('packages', value, updatedBy);
  pricingCache = { value: mergePricing(value as never), at: Date.now() };
}

export async function saveAvailabilityConfig(value: BookingAvailability, updatedBy: string): Promise<void> {
  await writeSetting('availability', value, updatedBy);
  availabilityCache = { value: mergeAvailability(value), at: Date.now() };
}

// Re-export defaults for callers that want them without reaching into settings-config.
export { DEFAULT_PRICING, BOOKING_AVAILABILITY };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/settings-store.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/settings-store.ts src/lib/settings-store.test.ts
git commit -m "feat(admin): Sheet-backed settings store with cache + fail-open"
```

---

## Task 4: Wire booking page + API to the store (server-authoritative pricing)

**Files:**
- Modify: `src/app/konsultasi/booking/page.tsx`
- Modify: `src/app/konsultasi/booking/BookingFlow.tsx`
- Modify: `src/app/api/konsultasi/book/route.ts`

- [ ] **Step 1: Update the booking page to read from the store**

Replace the entire body of `src/app/konsultasi/booking/page.tsx` with:

```tsx
import React from 'react';
import { Metadata } from 'next';
import BookingFlow from './BookingFlow';
import { getSelectableDates } from './lib/availability';
import { getFreeSlotsByDate } from '@/lib/konsultasi-availability';
import { getPaymentDisplay } from '@/lib/konsultasi-payment';
import { getAvailabilityConfig, getPackagePricing } from '@/lib/settings-store';

export const metadata: Metadata = {
  title: 'Booking Konsultasi Keuangan',
  description: 'Jadwalkan sesi konsultasi keuangan 1-on-1 bersama Perencana Keuangan bersertifikat.',
};

export const dynamic = 'force-dynamic'; // dates depend on "today" + live settings

export default async function BookingPage() {
  const today = new Date();
  const config = await getAvailabilityConfig();
  const pricing = await getPackagePricing();
  const dates = getSelectableDates(config, today);
  const slotsByDate = await getFreeSlotsByDate(config, dates);

  return (
    <main className="bg-[#F0F7FA] min-h-screen pt-32 pb-20">
      <BookingFlow
        enabled={config.enabled}
        dates={dates}
        slotsByDate={slotsByDate}
        payment={getPaymentDisplay()}
        pricing={pricing}
      />
    </main>
  );
}
```

- [ ] **Step 2: Update BookingFlow to take `pricing` and render strikethrough**

In `src/app/konsultasi/booking/BookingFlow.tsx`:

Replace the import on line 9:

```tsx
import { formatIDR } from '@/lib/konsultasi-packages';
import type { KonsultasiPackageId } from '@/lib/konsultasi-packages';
import type { PackagePricing } from '@/lib/settings-config';
```

Add `pricing` to the `Props` type (currently lines 12-17):

```tsx
type Props = {
  enabled: boolean;
  dates: string[];
  slotsByDate: Record<string, string[]>;
  payment: PaymentDisplay;
  pricing: PackagePricing;
};
```

Update the component signature (line 21):

```tsx
export default function BookingFlow({ enabled, dates, slotsByDate, payment, pricing }: Props) {
```

Replace the `pkgAmount`/`selectedAmount` block (currently lines 38-40) with:

```tsx
  const pkgPrice = (id: string) => pricing[id as KonsultasiPackageId] ?? null;
  const pkgAmount = (id: string) => {
    const p = pkgPrice(id);
    return p ? (p.salePrice ?? p.price) : 0;
  };
  const selectedPkg = t.packages.items.find((p) => p.id === form.packageId);
  const selectedAmount = pkgAmount(form.packageId);
```

Replace the price line in the package card (currently line 154). The surrounding `.map()` already exposes the package as `p`, so use `p.id`:

```tsx
                        <p className="text-[20px] font-extrabold text-[#205781] mt-1">
                          {(() => {
                            const pr = pkgPrice(p.id);
                            if (pr && pr.salePrice != null) {
                              return (
                                <>
                                  <span className="text-[14px] font-semibold text-[#9C9B99] line-through mr-2">
                                    {formatIDR(pr.price)}
                                  </span>
                                  {formatIDR(pr.salePrice)}
                                </>
                              );
                            }
                            return formatIDR(pkgAmount(p.id));
                          })()}
                        </p>
```

(The confirm-step lines that use `formatIDR(selectedAmount)` — currently lines 79, 242, 246 — already resolve to the charged amount and need no change.)

- [ ] **Step 3: Update the book API to resolve amount + availability from the store**

In `src/app/api/konsultasi/book/route.ts`:

Replace the imports on lines 3-7:

```tsx
import { isSlotAvailable } from '@/lib/konsultasi-availability';
import { appendBooking } from '@/lib/konsultasi-store';
import { createBookingEvent } from '@/lib/google-calendar';
import { KONSULTASI_PACKAGE_IDS, getKonsultasiPackage } from '@/lib/konsultasi-packages';
import { getAvailabilityConfig, getPackagePricing } from '@/lib/settings-store';
import { resolveAmount } from '@/lib/settings-config';
```

Replace the slot-check + booking block (currently lines 38-56) with:

```tsx
    const config = await getAvailabilityConfig();
    if (!(await isSlotAvailable(config, date, timeSlot, new Date()))) {
      return NextResponse.json(
        { success: false, message: 'Jadwal yang dipilih sudah tidak tersedia.' },
        { status: 400 },
      );
    }

    const pricing = await getPackagePricing();
    const amount = resolveAmount(pricing[packageId]);

    const bookingId = makeBookingId(new Date());
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
```

Update the `durationMinutes` line (currently line 63) inside `createBookingEvent`:

```tsx
      durationMinutes: config.slotMinutes,
```

- [ ] **Step 4: Verify build + existing tests pass**

Run: `npx tsc --noEmit && npx vitest run`
Expected: no type errors; all existing tests (incl. `availability.test.ts`) still PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/konsultasi/booking/page.tsx src/app/konsultasi/booking/BookingFlow.tsx src/app/api/konsultasi/book/route.ts
git commit -m "feat(booking): read prices + availability from settings store, show sale price"
```

---

## Task 5: Bookings list + status update in konsultasi-store

**Files:**
- Modify: `src/lib/konsultasi-store.ts`
- Test: `src/lib/konsultasi-store.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/konsultasi-store.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/konsultasi-store.test.ts`
Expected: FAIL — `listBookings`/`updateBookingStatus` are not exported.

- [ ] **Step 3: Add the implementation**

Append to `src/lib/konsultasi-store.ts` (after `appendBooking`):

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/konsultasi-store.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/konsultasi-store.ts src/lib/konsultasi-store.test.ts
git commit -m "feat(admin): listBookings + updateBookingStatus on konsultasi-store"
```

---

## Task 6: Admin API routes (settings + bookings)

**Files:**
- Create: `src/app/api/admin/settings/packages/route.ts`
- Create: `src/app/api/admin/settings/availability/route.ts`
- Create: `src/app/api/admin/bookings/route.ts`
- Create: `src/app/api/admin/bookings/[id]/route.ts`

- [ ] **Step 1: Packages settings route**

```ts
// src/app/api/admin/settings/packages/route.ts
import { NextResponse } from 'next/server';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { getPackagePricing, savePackagePricing } from '@/lib/settings-store';
import { pricingSchema, mergePricing } from '@/lib/settings-config';

export async function GET() {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ success: true, pricing: await getPackagePricing() });
}

export async function PUT(request: Request) {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = pricingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Data harga tidak valid.' }, { status: 400 });
  }
  const value = mergePricing(parsed.data as never);
  await savePackagePricing(value, session.email);
  return NextResponse.json({ success: true, pricing: value });
}
```

- [ ] **Step 2: Availability settings route**

```ts
// src/app/api/admin/settings/availability/route.ts
import { NextResponse } from 'next/server';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { getAvailabilityConfig, saveAvailabilityConfig } from '@/lib/settings-store';
import { availabilitySchema, mergeAvailability } from '@/lib/settings-config';

export async function GET() {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ success: true, availability: await getAvailabilityConfig() });
}

export async function PUT(request: Request) {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Konfigurasi tidak valid.' }, { status: 400 });
  }
  const value = mergeAvailability(parsed.data);
  await saveAvailabilityConfig(value, session.email);
  return NextResponse.json({ success: true, availability: value });
}
```

- [ ] **Step 3: Bookings list + status routes**

```ts
// src/app/api/admin/bookings/route.ts
import { NextResponse } from 'next/server';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { listBookings } from '@/lib/konsultasi-store';

export async function GET() {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ success: true, bookings: await listBookings() });
}
```

```ts
// src/app/api/admin/bookings/[id]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { updateBookingStatus } from '@/lib/konsultasi-store';

export const ADMIN_BOOKING_STATUSES = ['pending_payment', 'paid', 'cancelled', 'refunded'] as const;

const schema = z.object({ status: z.enum(ADMIN_BOOKING_STATUSES) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Status tidak valid.' }, { status: 400 });
  }
  const ok = await updateBookingStatus(id, parsed.data.status);
  if (!ok) return NextResponse.json({ success: false, message: 'Booking tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin
git commit -m "feat(admin): settings + bookings API routes (session-guarded)"
```

---

## Task 7: Move invoice tool + login under /admin (routing consolidation)

> Done as one atomic task so the app stays buildable. The invoice **API** routes stay at `/api/invoice/*` and `/api/invoice-auth/*` — only page paths move.

**Files:**
- Move: `src/app/generate-invoice/**` → `src/app/admin/invoice/**`
- Move: `src/app/generate-invoice/login/**` → `src/app/admin/login/**`
- Modify: `next.config.ts`
- Modify path strings in moved files + `src/app/admin/invoice/list/InvoiceList.tsx`, `InvoiceGenerator.tsx`, etc.

- [ ] **Step 1: Move files with git**

```bash
cd "/Users/nailul.fadloil/Documents/trae_projects/CFP Very"
mkdir -p src/app/admin/invoice src/app/admin/login
git mv src/app/generate-invoice/login/page.tsx src/app/admin/login/page.tsx
git mv src/app/generate-invoice/login/LoginForm.tsx src/app/admin/login/LoginForm.tsx
git mv src/app/generate-invoice/page.tsx src/app/admin/invoice/page.tsx
git mv src/app/generate-invoice/layout.tsx src/app/admin/invoice/layout.tsx
git mv src/app/generate-invoice/InvoiceGenerator.tsx src/app/admin/invoice/InvoiceGenerator.tsx
git mv src/app/generate-invoice/list src/app/admin/invoice/list
git mv "src/app/generate-invoice/[id]" "src/app/admin/invoice/[id]"
rmdir src/app/generate-invoice/login src/app/generate-invoice 2>/dev/null || true
```

- [ ] **Step 2: Update all path strings in the moved files**

Replace every occurrence of `/generate-invoice/login` → `/admin/login` and `/generate-invoice` → `/admin/invoice` across the moved files. Run this sed sweep, then eyeball the diff:

```bash
cd "/Users/nailul.fadloil/Documents/trae_projects/CFP Very"
grep -rl "/generate-invoice" src/app/admin | while read -r f; do
  sed -i '' 's#/generate-invoice/login#/admin/login#g; s#/generate-invoice#/admin/invoice#g' "$f"
done
grep -rn "generate-invoice" src/app/admin || echo "no stragglers"
```

Expected: "no stragglers". (Order matters: the `/login` replacement runs first so it isn't shadowed by the broader rule.)

- [ ] **Step 3: Make the login form honor `?next=` and default to `/admin`**

In `src/app/admin/login/LoginForm.tsx`, add the `useSearchParams` import and replace the redirect. Change the React import line to:

```tsx
import { useRouter, useSearchParams } from 'next/navigation';
```

Inside `LoginForm`, after `const router = useRouter();` add:

```tsx
  const searchParams = useSearchParams();
```

Replace `router.replace('/admin/invoice');` (the line the sed sweep produced from `/generate-invoice`) with:

```tsx
      const next = searchParams.get('next') || '/admin';
      router.replace(next);
```

Because the page uses `useSearchParams`, wrap its usage in Suspense. In `src/app/admin/login/page.tsx`, ensure the form is rendered inside `<React.Suspense>`. Replace the page body with:

```tsx
import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'Admin Login' };

export default async function AdminLoginPage() {
  const session = await getInvoiceSession();
  if (session) redirect('/admin');

  return (
    <main className="bg-[#F0F7FA] min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8">
        <h1 className="text-2xl font-extrabold text-[#1A1918] mb-1">Admin</h1>
        <p className="text-sm text-[#666666] mb-6">Masuk untuk mengelola booking, paket, dan invoice.</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
```

> If the original login page had different surrounding markup you want to keep, preserve it but keep the `Suspense` wrapper and the `redirect('/admin')`.

- [ ] **Step 4: Add old-URL redirects in next.config.ts**

In `src/app/admin/invoice/page.tsx`, the guard line should now read `redirect('/admin/login')`. Then add redirects to `next.config.ts` — insert this property into the `nextConfig` object:

```ts
  async redirects() {
    return [
      { source: '/generate-invoice', destination: '/admin/invoice', permanent: true },
      { source: '/generate-invoice/login', destination: '/admin/login', permanent: true },
      { source: '/generate-invoice/:path*', destination: '/admin/invoice/:path*', permanent: true },
    ];
  },
```

- [ ] **Step 5: Verify build + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no type errors, no lint errors, no remaining `/generate-invoice` references in `src/app/admin`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(admin): move invoice tool + login under /admin, redirect old URLs"
```

---

## Task 8: Admin hub page

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Write the hub**

```tsx
// src/app/admin/page.tsx
import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarClock, Wallet, CalendarRange, FileText } from 'lucide-react';
import { getInvoiceSession } from '@/lib/invoice-auth';

export const metadata = { title: 'Admin Dashboard' };

const CARDS = [
  { href: '/admin/bookings', title: 'Booking', desc: 'Lihat & kelola pesanan konsultasi.', Icon: CalendarClock },
  { href: '/admin/packages', title: 'Paket & Harga', desc: 'Ubah harga dan harga promo paket.', Icon: Wallet },
  { href: '/admin/availability', title: 'Jadwal Tersedia', desc: 'Atur hari, jam, dan tanggal libur.', Icon: CalendarRange },
  { href: '/admin/invoice/list', title: 'Invoice', desc: 'Buat dan kelola invoice klien.', Icon: FileText },
];

export default async function AdminHome() {
  const session = await getInvoiceSession();
  if (!session) redirect('/admin/login?next=/admin');

  return (
    <main className="bg-[#F0F7FA] min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#1A1918]">Admin Dashboard</h1>
        <p className="text-[#666666] mt-1 mb-10">Masuk sebagai {session.email}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CARDS.map(({ href, title, desc, Icon }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-7 hover:border-[#205781] transition-colors"
            >
              <Icon className="text-[#205781]" size={28} />
              <h2 className="text-lg font-bold text-[#1A1918] mt-4">{title}</h2>
              <p className="text-sm text-[#666666] mt-1">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat(admin): dashboard hub page"
```

---

## Task 9: Packages & pricing editor

**Files:**
- Create: `src/app/admin/packages/page.tsx`
- Create: `src/app/admin/packages/PackagesForm.tsx`

- [ ] **Step 1: Server page (guard + initial data)**

```tsx
// src/app/admin/packages/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { getPackagePricing } from '@/lib/settings-store';
import { KONSULTASI_PACKAGES } from '@/lib/konsultasi-packages';
import PackagesForm from './PackagesForm';

export const metadata = { title: 'Paket & Harga — Admin' };
export const dynamic = 'force-dynamic';

export default async function PackagesPage() {
  const session = await getInvoiceSession();
  if (!session) redirect('/admin/login?next=/admin/packages');

  const pricing = await getPackagePricing();
  const packages = KONSULTASI_PACKAGES.map((p) => ({ id: p.id, service: p.service }));

  return (
    <main className="bg-[#F0F7FA] min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <PackagesForm packages={packages} initialPricing={pricing} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Client form**

```tsx
// src/app/admin/packages/PackagesForm.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { PackagePricing } from '@/lib/settings-config';
import { formatIDR } from '@/lib/konsultasi-packages';

type Pkg = { id: keyof PackagePricing; service: string };

export default function PackagesForm({
  packages,
  initialPricing,
}: {
  packages: Pkg[];
  initialPricing: PackagePricing;
}) {
  const [pricing, setPricing] = useState<PackagePricing>(initialPricing);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const setField = (id: keyof PackagePricing, field: 'price' | 'salePrice', raw: string) => {
    const n = raw === '' ? (field === 'salePrice' ? null : 0) : Math.max(0, Math.round(Number(raw)));
    setPricing((prev) => ({ ...prev, [id]: { ...prev[id], [field]: n } }));
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsg({ kind: 'err', text: data.message || 'Gagal menyimpan.' });
        return;
      }
      setPricing(data.pricing);
      setMsg({ kind: 'ok', text: 'Tersimpan.' });
    } catch {
      setMsg({ kind: 'err', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#205781] mb-6">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <h1 className="text-2xl font-extrabold text-[#1A1918] mb-6">Paket & Harga</h1>

      <div className="space-y-5">
        {packages.map((pkg) => {
          const p = pricing[pkg.id];
          const onSale = p.salePrice != null && p.salePrice < p.price;
          return (
            <div key={pkg.id} className="bg-white rounded-2xl border border-[#E0EBF5] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1A1918]">{pkg.service}</h2>
                <span className="text-sm font-semibold text-[#205781]">
                  {onSale ? (
                    <>
                      <span className="text-[#9C9B99] line-through mr-2">{formatIDR(p.price)}</span>
                      {formatIDR(p.salePrice!)}
                    </>
                  ) : (
                    formatIDR(p.price)
                  )}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Harga (IDR)</span>
                  <input
                    type="number"
                    min={0}
                    value={p.price}
                    onChange={(e) => setField(pkg.id, 'price', e.target.value)}
                    className="w-full h-[48px] px-3 bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#f79d35]"
                  />
                </label>
                <label className="block">
                  <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Harga promo (kosongkan jika tidak ada)</span>
                  <input
                    type="number"
                    min={0}
                    value={p.salePrice ?? ''}
                    onChange={(e) => setField(pkg.id, 'salePrice', e.target.value)}
                    className="w-full h-[48px] px-3 bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#f79d35]"
                  />
                </label>
              </div>
              {p.salePrice != null && p.salePrice >= p.price && (
                <p className="text-[12px] text-[#8C1C00] mt-2">Harga promo harus lebih kecil dari harga normal.</p>
              )}
            </div>
          );
        })}
      </div>

      {msg && (
        <p className={`mt-5 text-sm ${msg.kind === 'ok' ? 'text-[#1B7A3F]' : 'text-[#8C1C00]'}`}>{msg.text}</p>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f79d35] px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {saving && <Loader2 className="animate-spin" size={18} />}
        Simpan
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/packages
git commit -m "feat(admin): packages & pricing editor with sale price"
```

---

## Task 10: Availability editor

**Files:**
- Create: `src/app/admin/availability/page.tsx`
- Create: `src/app/admin/availability/AvailabilityForm.tsx`

- [ ] **Step 1: Server page**

```tsx
// src/app/admin/availability/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { getAvailabilityConfig } from '@/lib/settings-store';
import AvailabilityForm from './AvailabilityForm';

export const metadata = { title: 'Jadwal Tersedia — Admin' };
export const dynamic = 'force-dynamic';

export default async function AvailabilityPage() {
  const session = await getInvoiceSession();
  if (!session) redirect('/admin/login?next=/admin/availability');

  const availability = await getAvailabilityConfig();
  return (
    <main className="bg-[#F0F7FA] min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <AvailabilityForm initial={availability} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Client form**

```tsx
// src/app/admin/availability/AvailabilityForm.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import type { BookingAvailability } from '@/lib/booking-availability';

const WEEKDAYS = [
  { n: 1, label: 'Sen' }, { n: 2, label: 'Sel' }, { n: 3, label: 'Rab' },
  { n: 4, label: 'Kam' }, { n: 5, label: 'Jum' }, { n: 6, label: 'Sab' }, { n: 0, label: 'Min' },
];

const numField = 'w-full h-[48px] px-3 bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#f79d35]';

export default function AvailabilityForm({ initial }: { initial: BookingAvailability }) {
  const [cfg, setCfg] = useState<BookingAvailability>(initial);
  const [newDate, setNewDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const setNum = (k: keyof BookingAvailability, v: string) =>
    setCfg((c) => ({ ...c, [k]: Math.max(0, Math.round(Number(v) || 0)) }));

  const toggleWeekday = (n: number) =>
    setCfg((c) => ({
      ...c,
      weekdays: c.weekdays.includes(n) ? c.weekdays.filter((d) => d !== n) : [...c.weekdays, n].sort(),
    }));

  const addBlackout = () => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(newDate) && !cfg.blackoutDates.includes(newDate)) {
      setCfg((c) => ({ ...c, blackoutDates: [...c.blackoutDates, newDate].sort() }));
      setNewDate('');
    }
  };
  const removeBlackout = (d: string) =>
    setCfg((c) => ({ ...c, blackoutDates: c.blackoutDates.filter((x) => x !== d) }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsg({ kind: 'err', text: data.message || 'Gagal menyimpan.' });
        return;
      }
      setCfg(data.availability);
      setMsg({ kind: 'ok', text: 'Tersimpan.' });
    } catch {
      setMsg({ kind: 'err', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#205781] mb-6">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <h1 className="text-2xl font-extrabold text-[#1A1918] mb-6">Jadwal Tersedia</h1>

      <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6 space-y-6">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg((c) => ({ ...c, enabled: e.target.checked }))} />
          <span className="font-semibold text-[#1A1918]">Booking dibuka</span>
        </label>

        <div>
          <span className="block text-[13px] font-semibold text-[#3A5A70] mb-2">Hari kerja</span>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((w) => (
              <button
                key={w.n}
                type="button"
                onClick={() => toggleWeekday(w.n)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  cfg.weekdays.includes(w.n)
                    ? 'bg-[#205781] text-white border-[#205781]'
                    : 'bg-white text-[#666666] border-[#CBDCEA]'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Jam mulai (0–23)</span>
            <input type="number" min={0} max={23} value={cfg.startHour} onChange={(e) => setNum('startHour', e.target.value)} className={numField} />
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Jam selesai (1–24)</span>
            <input type="number" min={1} max={24} value={cfg.endHour} onChange={(e) => setNum('endHour', e.target.value)} className={numField} />
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Durasi sesi (menit)</span>
            <input type="number" min={1} value={cfg.slotMinutes} onChange={(e) => setNum('slotMinutes', e.target.value)} className={numField} />
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Lead time (hari)</span>
            <input type="number" min={0} value={cfg.leadTimeDays} onChange={(e) => setNum('leadTimeDays', e.target.value)} className={numField} />
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Horizon (hari)</span>
            <input type="number" min={1} value={cfg.horizonDays} onChange={(e) => setNum('horizonDays', e.target.value)} className={numField} />
          </label>
        </div>

        <div>
          <span className="block text-[13px] font-semibold text-[#3A5A70] mb-2">Tanggal libur (blackout)</span>
          <div className="flex gap-2 mb-3">
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={`${numField} max-w-[200px]`} />
            <button type="button" onClick={addBlackout} className="rounded-full bg-[#205781] text-white px-4 font-semibold text-sm">Tambah</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cfg.blackoutDates.map((d) => (
              <span key={d} className="inline-flex items-center gap-1 bg-[#E0EBF5] text-[#205781] rounded-full px-3 py-1 text-sm">
                {d}
                <button type="button" onClick={() => removeBlackout(d)} aria-label={`Hapus ${d}`}><X size={14} /></button>
              </span>
            ))}
            {cfg.blackoutDates.length === 0 && <span className="text-sm text-[#9C9B99]">Tidak ada.</span>}
          </div>
        </div>
      </div>

      {msg && <p className={`mt-5 text-sm ${msg.kind === 'ok' ? 'text-[#1B7A3F]' : 'text-[#8C1C00]'}`}>{msg.text}</p>}

      <button onClick={save} disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f79d35] px-6 py-3 font-semibold text-white disabled:opacity-60">
        {saving && <Loader2 className="animate-spin" size={18} />}
        Simpan
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/availability
git commit -m "feat(admin): availability editor (rules + blackout dates)"
```

---

## Task 11: Bookings table + status management

**Files:**
- Create: `src/app/admin/bookings/page.tsx`
- Create: `src/app/admin/bookings/BookingsTable.tsx`

- [ ] **Step 1: Server page**

```tsx
// src/app/admin/bookings/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { listBookings } from '@/lib/konsultasi-store';
import BookingsTable from './BookingsTable';

export const metadata = { title: 'Booking — Admin' };
export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const session = await getInvoiceSession();
  if (!session) redirect('/admin/login?next=/admin/bookings');

  let bookings: Awaited<ReturnType<typeof listBookings>> = [];
  let error: string | null = null;
  try {
    bookings = await listBookings();
  } catch {
    error = 'Gagal memuat data booking.';
  }

  return (
    <main className="bg-[#F0F7FA] min-h-screen px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <BookingsTable initial={bookings} initialError={error} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Client table**

```tsx
// src/app/admin/bookings/BookingsTable.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import type { Booking } from '@/lib/konsultasi-store';

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Menunggu Bayar' },
  { value: 'paid', label: 'Lunas' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'refunded', label: 'Dikembalikan' },
] as const;

const STATUS_STYLE: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-800 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  refunded: 'bg-gray-100 text-gray-600 border-gray-200',
};

const fmtIDR = (raw: string) => {
  const n = Number(raw);
  return Number.isFinite(n) && raw !== '' ? `Rp${n.toLocaleString('id-ID')}` : raw;
};

export default function BookingsTable({
  initial,
  initialError,
}: {
  initial: Booking[];
  initialError: string | null;
}) {
  const [rows, setRows] = useState<Booking[]>(initial);
  const [error, setError] = useState<string | null>(initialError);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const refresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal memuat.');
        return;
      }
      setRows(data.bookings);
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setRefreshing(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    const prev = rows;
    setPendingId(id);
    setRows((r) => r.map((b) => (b.id === id ? { ...b, paymentStatus: status } : b)));
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setRows(prev);
        setError(data.message || 'Gagal memperbarui status.');
      }
    } catch {
      setRows(prev);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#205781]">
          <ArrowLeft size={16} /> Kembali
        </Link>
        <button onClick={refresh} disabled={refreshing} className="inline-flex items-center gap-2 text-sm font-semibold text-[#205781]">
          {refreshing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
          Muat ulang
        </button>
      </div>
      <h1 className="text-2xl font-extrabold text-[#1A1918] mb-6">Booking</h1>

      {error && <p className="mb-4 text-sm text-[#8C1C00] bg-[#FFF0EB] border border-[#f5c4b4] rounded-lg px-3 py-2">{error}</p>}

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E0EBF5] p-10 text-center text-[#666666]">Belum ada booking.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E0EBF5] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#666666] border-b border-[#E0EBF5]">
                <th className="px-4 py-3 font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">Paket</th>
                <th className="px-4 py-3 font-semibold">Jadwal</th>
                <th className="px-4 py-3 font-semibold">Topik</th>
                <th className="px-4 py-3 font-semibold">Nilai</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-b border-[#F0F7FA] last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1A1918]">{b.name}</div>
                    <div className="text-[#9C9B99]">{b.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[#1A1918]">{b.service}</td>
                  <td className="px-4 py-3 text-[#1A1918]">{b.date ? `${b.date} ${b.time ?? ''}` : b.bookingDate}</td>
                  <td className="px-4 py-3 max-w-[220px] truncate text-[#666666]" title={b.topic}>{b.topic}</td>
                  <td className="px-4 py-3 text-[#1A1918]">{fmtIDR(b.amount)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={STATUS_OPTIONS.some((o) => o.value === b.paymentStatus) ? b.paymentStatus : 'pending_payment'}
                      onChange={(e) => changeStatus(b.id, e.target.value)}
                      disabled={pendingId === b.id}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[b.paymentStatus] ?? STATUS_STYLE.pending_payment}`}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/bookings
git commit -m "feat(admin): bookings table with status management"
```

---

## Task 12: Full verification + manual smoke test

**Files:** none (verification only)

- [ ] **Step 1: Run the full automated suite**

Run: `npx tsc --noEmit && npm run lint && npx vitest run`
Expected: no type errors, no lint errors, all tests PASS.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds with all `/admin/*` routes listed.

- [ ] **Step 3: Manual smoke (dev server)**

Run: `npm run dev`, then verify in a browser (you must have the invoice env vars + Google Sheet configured):
- `/admin` while logged out → redirects to `/admin/login?next=/admin`.
- Log in with the invoice credentials → lands on `/admin`.
- `/admin/packages` → change a sale price, Save → reload the public `/konsultasi/booking` page and confirm the strikethrough + sale price show, and that a test booking records the **sale** amount in the Order sheet.
- `/admin/availability` → toggle a weekday / add a blackout date, Save → confirm `/konsultasi/booking` reflects the change (allow ~60s for the cache, or restart dev).
- `/admin/bookings` → change a booking status to "Dibatalkan" → confirm the freed slot reappears as bookable on `/konsultasi/booking`.
- Old URL `/generate-invoice/list` → redirects to `/admin/invoice/list`.

- [ ] **Step 4: Final commit (if any cleanup was needed)**

```bash
git add -A
git commit -m "chore(admin): verification cleanup" || echo "nothing to commit"
```

---

## Self-Review Notes

- **Spec coverage:** Settings storage (Task 3) ✓; sale-price pricing model (Tasks 1, 4, 9) ✓; availability rules + blackout editor (Tasks 1, 10) ✓; bookings view + status with slot-release (Tasks 5, 11) ✓; `/admin` hub + invoice move + single login + old-URL redirects (Tasks 7, 8) ✓; reuse of `getInvoiceSession` (Tasks 6–11) ✓; server-authoritative charged amount (Task 4) ✓; Indonesian-only admin UI, no `translations.ts` changes ✓.
- **Env:** add `GOOGLE_SETTINGS_TAB` (optional, defaults to `Settings`). No other new env vars; the `Settings` tab is auto-created by `ensureSheetTab` on first save.
- **Type consistency:** `PackagePricing`, `PackagePrice`, `resolveAmount`, `mergePricing`, `mergeAvailability`, `Booking`, `getPackagePricing`, `getAvailabilityConfig`, `listBookings`, `updateBookingStatus` are referenced with consistent signatures across tasks.
