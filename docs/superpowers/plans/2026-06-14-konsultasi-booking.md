# Konsultasi Keuangan — Service Page & Booking Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated `/konsultasi` service detail page and a 3-step offline-payment booking flow (`/konsultasi/booking`) that records bookings to Google Sheets, with admin-configurable availability.

**Architecture:** Next.js 15 App Router. The service page is a server component assembling reusable section components. The booking flow is a single `'use client'` wizard (like `HealthCheckForm`) over pure, testable availability helpers. A `zod`-validated route handler appends bookings to Google Sheets. Payment is fully offline (instructions + WhatsApp). All UI strings are bilingual (ID/EN) via the existing `translations.ts` + `useLang()`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, `zod`, `react-hook-form` (already present), Google Sheets API (`src/lib/google-sheets.ts`), Vitest (new, for unit tests).

**Reference spec:** `docs/superpowers/specs/2026-06-14-konsultasi-booking-design.md`
**Design reference:** `design website.pen` nodes `baG1y` (stepper), `ICbdI`, `4rk7V`, `PpzHi`, `pbCZ9`.

---

## File Structure

**Create:**
- `vitest.config.ts` — test runner config (node environment)
- `src/lib/booking-availability.ts` — availability config (admin-edited) + `BookingAvailability` type
- `src/app/konsultasi/booking/lib/availability.ts` — pure helpers (selectable dates, slots, validation)
- `src/app/konsultasi/booking/lib/availability.test.ts` — unit tests for the helpers
- `src/app/konsultasi/booking/lib/types.ts` — `BookingForm`, `BookingStep` types
- `src/lib/konsultasi-store.ts` — `server-only` Google Sheets writer (`appendBooking`, `HEADERS`)
- `src/lib/konsultasi-payment.ts` — `server-only` display data (banks + QRIS + WhatsApp) for confirmation
- `src/app/api/konsultasi/book/route.ts` — `POST` handler (zod validate → re-validate slot → append)
- `src/app/konsultasi/page.tsx` — service detail page (server component, metadata)
- `src/app/konsultasi/booking/page.tsx` — booking page (renders `BookingFlow`, passes server data)
- `src/app/konsultasi/booking/BookingFlow.tsx` — `'use client'` 3-step wizard
- `src/components/sections/konsultasi/KonsultasiHero.tsx`
- `src/components/sections/konsultasi/BagaimanaKamiMembantu.tsx`
- `src/components/sections/konsultasi/LayananKonsultasi.tsx`
- `src/components/sections/konsultasi/KonsultasiFAQ.tsx`
- `public/konsultasi-qris.png` — placeholder (user replaces with real QRIS)

**Modify:**
- `package.json` — add `vitest` devDep + `test` script
- `src/lib/translations.ts` — add `konsultasi` namespace (ID first, EN second)
- `src/components/sections/Services.tsx` — re-point the consultation card CTA to `/konsultasi`

---

## Task 1: Test infrastructure (Vitest)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest@^2`
Expected: adds `vitest` to devDependencies, no peer-dep errors.

- [ ] **Step 2: Add test script to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

- [ ] **Step 4: Verify the runner starts (no tests yet)**

Run: `npm test`
Expected: exits 0 with "No test files found" (or similar) — confirms config loads.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest for unit tests"
```

---

## Task 2: Availability config + type

**Files:**
- Create: `src/lib/booking-availability.ts`

- [ ] **Step 1: Write the config module**

```ts
// Admin-editable booking availability. Edit these values to control when booking is
// open and which days/times are offered. No code changes elsewhere are required.
export type BookingAvailability = {
  /** Master switch. When false, the booking wizard is hidden and a "closed" notice shows. */
  enabled: boolean;
  /** Display label only; all times are treated as WIB. */
  timezone: 'Asia/Jakarta';
  /** Bookable weekdays: 0=Sun, 1=Mon, ... 6=Sat. Default: every day (Mon–Sun). */
  weekdays: number[];
  /** First slot start hour, 24h (9 = 09:00). */
  startHour: number;
  /** Window end hour, 24h (20 = 20:00). Slots are generated so the session ends by this hour. */
  endHour: number;
  /** Session length in minutes (initial meeting is 60). */
  slotMinutes: number;
  /** Earliest bookable day, as an offset in days from today (2 = not before H+2). */
  leadTimeDays: number;
  /** How many days ahead booking is open. */
  horizonDays: number;
  /** ISO dates (YYYY-MM-DD) to exclude (holidays, time off). */
  blackoutDates: string[];
};

export const BOOKING_AVAILABILITY: BookingAvailability = {
  enabled: true,
  timezone: 'Asia/Jakarta',
  weekdays: [0, 1, 2, 3, 4, 5, 6],
  startHour: 9,
  endHour: 20,
  slotMinutes: 60,
  leadTimeDays: 2,
  horizonDays: 30,
  blackoutDates: [],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/booking-availability.ts
git commit -m "feat(konsultasi): add booking availability config"
```

---

## Task 3: Pure availability helpers (TDD)

**Files:**
- Create: `src/app/konsultasi/booking/lib/availability.ts`
- Test: `src/app/konsultasi/booking/lib/availability.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { toISODate, getSelectableDates, getSlotsForDate, isValidSlot } from './availability';
import type { BookingAvailability } from '@/lib/booking-availability';

const base: BookingAvailability = {
  enabled: true,
  timezone: 'Asia/Jakarta',
  weekdays: [0, 1, 2, 3, 4, 5, 6],
  startHour: 9,
  endHour: 20,
  slotMinutes: 60,
  leadTimeDays: 2,
  horizonDays: 10,
  blackoutDates: [],
};

// Fixed reference date: Wed 2026-06-10
const today = new Date('2026-06-10T00:00:00+07:00');

describe('toISODate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toISODate(new Date('2026-06-10T05:00:00+07:00'))).toBe('2026-06-10');
  });
});

describe('getSelectableDates', () => {
  it('returns [] when disabled', () => {
    expect(getSelectableDates({ ...base, enabled: false }, today)).toEqual([]);
  });

  it('honors leadTimeDays (earliest is today + leadTime)', () => {
    const dates = getSelectableDates(base, today);
    expect(dates[0]).toBe('2026-06-12'); // 10 + 2
  });

  it('honors horizonDays (latest is today + horizon)', () => {
    const dates = getSelectableDates(base, today);
    expect(dates[dates.length - 1]).toBe('2026-06-20'); // 10 + 10
  });

  it('excludes weekdays not in config', () => {
    // weekdays Mon-Fri only (1..5); 2026-06-13 is Sat, 06-14 Sun -> excluded
    const dates = getSelectableDates({ ...base, weekdays: [1, 2, 3, 4, 5] }, today);
    expect(dates).not.toContain('2026-06-13');
    expect(dates).not.toContain('2026-06-14');
  });

  it('excludes blackout dates', () => {
    const dates = getSelectableDates({ ...base, blackoutDates: ['2026-06-12'] }, today);
    expect(dates).not.toContain('2026-06-12');
  });
});

describe('getSlotsForDate', () => {
  it('returns [] when disabled', () => {
    expect(getSlotsForDate({ ...base, enabled: false }, '2026-06-12')).toEqual([]);
  });

  it('generates 60-min slots so the session ends by endHour', () => {
    // 09:00..19:00 (last session 19:00-20:00) = 11 slots
    const slots = getSlotsForDate(base, '2026-06-12');
    expect(slots[0]).toBe('09:00');
    expect(slots[slots.length - 1]).toBe('19:00');
    expect(slots).toHaveLength(11);
  });
});

describe('isValidSlot', () => {
  it('true for a date+slot that is offered', () => {
    expect(isValidSlot(base, '2026-06-12', '09:00', today)).toBe(true);
  });

  it('false for a date outside the window', () => {
    expect(isValidSlot(base, '2026-06-11', '09:00', today)).toBe(false); // before leadTime
  });

  it('false for a slot not generated', () => {
    expect(isValidSlot(base, '2026-06-12', '20:00', today)).toBe(false);
  });

  it('false when disabled', () => {
    expect(isValidSlot({ ...base, enabled: false }, '2026-06-12', '09:00', today)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- availability`
Expected: FAIL — `availability.ts` has no exports yet (cannot find module / undefined functions).

- [ ] **Step 3: Implement the helpers**

```ts
import type { BookingAvailability } from '@/lib/booking-availability';

/** Format a Date as a local YYYY-MM-DD string (uses the date's own calendar day). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Dates the customer may pick, from leadTime..horizon, filtered by weekday + blackouts. */
export function getSelectableDates(config: BookingAvailability, today: Date): string[] {
  if (!config.enabled) return [];
  const blackout = new Set(config.blackoutDates);
  const out: string[] = [];
  for (let offset = config.leadTimeDays; offset <= config.horizonDays; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const iso = toISODate(d);
    if (!config.weekdays.includes(d.getDay())) continue;
    if (blackout.has(iso)) continue;
    out.push(iso);
  }
  return out;
}

/** Time slots (HH:mm) for a date, sized so each session ends by endHour. */
export function getSlotsForDate(config: BookingAvailability, _date: string): string[] {
  if (!config.enabled) return [];
  const slots: string[] = [];
  const startMin = config.startHour * 60;
  const endMin = config.endHour * 60;
  for (let m = startMin; m + config.slotMinutes <= endMin; m += config.slotMinutes) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

/** Server-side guard: is this exact date+slot currently offered? */
export function isValidSlot(
  config: BookingAvailability,
  date: string,
  timeSlot: string,
  today: Date,
): boolean {
  if (!config.enabled) return false;
  if (!getSelectableDates(config, today).includes(date)) return false;
  return getSlotsForDate(config, date).includes(timeSlot);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- availability`
Expected: PASS (all cases green).

- [ ] **Step 5: Commit**

```bash
git add src/app/konsultasi/booking/lib/availability.ts src/app/konsultasi/booking/lib/availability.test.ts
git commit -m "feat(konsultasi): add tested availability helpers"
```

---

## Task 4: Booking types

**Files:**
- Create: `src/app/konsultasi/booking/lib/types.ts`

- [ ] **Step 1: Write the types**

```ts
export type BookingStep = 'schedule' | 'details' | 'confirm';

export type BookingForm = {
  date: string;      // 'YYYY-MM-DD' from getSelectableDates
  timeSlot: string;  // 'HH:mm' from getSlotsForDate
  name: string;
  email: string;
  phone: string;
  topic: string;     // free-text "what do you want to consult about"
};

export const EMPTY_BOOKING: BookingForm = {
  date: '',
  timeSlot: '',
  name: '',
  email: '',
  phone: '',
  topic: '',
};
```

- [ ] **Step 2: Commit**

```bash
git add src/app/konsultasi/booking/lib/types.ts
git commit -m "feat(konsultasi): add booking form types"
```

---

## Task 5: Google Sheets booking store

**Files:**
- Create: `src/lib/konsultasi-store.ts`

- [ ] **Step 1: Write the store**

Mirrors the header-bootstrap pattern in `src/app/api/health-check-lead/route.ts`.

```ts
import 'server-only';
import { appendSheetRow, getSheetRowCount } from './google-sheets';

export const HEADERS = [
  'Timestamp',
  'Booking ID',
  'Nama',
  'Email',
  'No. HP',
  'Tanggal Sesi',
  'Jam Sesi',
  'Topik Konsultasi',
  'Status',
  'Catatan',
] as const;

export type NewBooking = {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  topic: string;
};

export async function appendBooking(b: NewBooking): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');

  const tab = process.env.GOOGLE_KONSULTASI_TAB || 'Konsultasi Bookings';
  const range = `${tab}!A:J`;

  const rowCount = await getSheetRowCount(sheetId, range);
  if (rowCount === 0) {
    await appendSheetRow(sheetId, range, [...HEADERS]);
  }

  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  await appendSheetRow(sheetId, range, [
    timestamp,
    b.bookingId,
    b.name,
    b.email,
    b.phone || '-',
    b.date,
    b.timeSlot,
    b.topic,
    'Pending',
    '',
  ]);
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors related to `konsultasi-store.ts`. (Pre-existing unrelated errors, if any, are out of scope — confirm none are in this file.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/konsultasi-store.ts
git commit -m "feat(konsultasi): add google sheets booking store"
```

---

## Task 6: Payment display data (server-only)

**Files:**
- Create: `src/lib/konsultasi-payment.ts`

- [ ] **Step 1: Write the module**

Reuses the bank accounts already defined in `invoice-payments.ts` and adds QRIS + WhatsApp display data for the confirmation step. Server-only so it is never bundled wholesale to the client; the booking page (a server component) passes the needed fields down as props.

```ts
import 'server-only';
import { PAYMENT_ACCOUNTS } from './invoice-payments';

export type PaymentDisplay = {
  banks: { label: string; accountName: string; accountNumber: string }[];
  qrisImageSrc: string;
  qrisName: string;
  whatsappUrl: string;
};

export function getPaymentDisplay(): PaymentDisplay {
  const banks = PAYMENT_ACCOUNTS.filter((a) => a.id === 'bni' || a.id === 'bca').map((a) => ({
    label: a.label,
    accountName: a.accountName,
    accountNumber: a.accountNumber,
  }));

  return {
    banks,
    qrisImageSrc: '/konsultasi-qris.png',
    qrisName: 'Aditya Very Cleverina',
    whatsappUrl:
      'https://wa.me/6281806484635?text=Halo%2C+saya+ingin+konfirmasi+pembayaran+konsultasi',
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/konsultasi-payment.ts
git commit -m "feat(konsultasi): add payment display data for confirmation step"
```

---

## Task 7: Booking API route

**Files:**
- Create: `src/app/api/konsultasi/book/route.ts`

- [ ] **Step 1: Write the route handler**

Mirrors validation style of `src/app/api/contact/route.ts`. Re-validates the slot server-side with `isValidSlot` to reject tampered/stale submissions, then appends to Sheets.

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BOOKING_AVAILABILITY } from '@/lib/booking-availability';
import { isValidSlot } from '@/app/konsultasi/booking/lib/availability';
import { appendBooking } from '@/lib/konsultasi-store';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  topic: z.string().min(10),
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

    const { name, email, phone, date, timeSlot, topic } = parsed.data;

    if (!isValidSlot(BOOKING_AVAILABILITY, date, timeSlot, new Date())) {
      return NextResponse.json(
        { success: false, message: 'Jadwal yang dipilih sudah tidak tersedia.' },
        { status: 400 },
      );
    }

    const bookingId = makeBookingId(new Date());
    await appendBooking({ bookingId, name, email, phone: phone ?? '', date, timeSlot, topic });

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    console.error('Konsultasi booking error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors in this file.

- [ ] **Step 3: Manual smoke test (dev server)**

Run dev server (`npm run dev`), then:

```bash
curl -s -X POST http://localhost:3000/api/konsultasi/book \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"t@e.com","date":"2026-06-12","timeSlot":"09:00","topic":"Saya ingin konsultasi dana pendidikan anak"}'
```
Expected (with valid `GOOGLE_SHEET_ID` + service-account env): `{"success":true,"bookingId":"KB-..."}` and a new row in the "Konsultasi Bookings" tab. Without Sheets env: `500` (acceptable for local without creds — note it). An invalid slot (e.g. `"timeSlot":"23:00"`) must return `400`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/konsultasi/book/route.ts
git commit -m "feat(konsultasi): add booking submission API route"
```

---

## Task 8: Translations (ID first, EN second)

**Files:**
- Modify: `src/lib/translations.ts`

- [ ] **Step 1: Add a `konsultasi` namespace to BOTH the `id` and `en` objects**

Add the block below inside the `id` object, then the same keys with English values inside the `en` object (ID is written first per CLAUDE.md). EN copy is a draft to be confirmed by the user.

```ts
// --- inside translations.id ---
konsultasi: {
  meta: {
    title: 'Konsultasi Keuangan Pribadi',
    description:
      'Konsultasi 1-on-1 bersama Perencana Keuangan bersertifikat untuk memetakan kondisi keuanganmu dan menyusun strategi yang sesuai dengan tujuanmu.',
  },
  hero: {
    eyebrow: 'KONSULTASI 1-ON-1',
    title: 'Konsultasi Keuangan Pribadi',
    subtitle:
      'Kami mulai dengan memetakan kondisi keuanganmu dan mengukur rasio kesehatan keuanganmu, lalu menyusun strategi yang sesuai dengan tujuan dan keadaanmu.',
    cta: 'Jadwalkan Sesi Konsultasi',
    badges: [
      { title: 'Data rahasia & terlindungi', desc: 'Datamu aman, privasimu terjaga' },
      { title: 'Wujudkan tujuan keuangan', desc: 'Tujuan keuanganmu, satu per satu tercapai' },
      { title: 'Resolusi keuangan tercapai', desc: 'Resolusi keuangan bukan cuma wacana' },
      { title: 'Kondisi keuangan membaik', desc: 'Keuangan yang makin sehat, hati yang makin tenang' },
    ],
  },
  help: {
    eyebrow: 'CARA KAMI MEMBANTU',
    title: 'Bagaimana Kami Mendampingi Kamu',
    subtitle:
      'Kami mulai dengan memetakan kondisi keuanganmu dan mengukur rasio kesehatan keuanganmu. Dari pemahaman itulah kami menyusun strategi yang sesuai dengan tujuan dan keadaan keuanganmu.',
    items: [
      { title: 'Financial Check Up', desc: 'Evaluasi keuangan menyeluruh bersama Perencana Keuangan bersertifikat untuk memahami kondisimu saat ini, mengenali yang perlu dibenahi, dan menentukan langkah awal yang tepat.' },
      { title: 'Menentukan Tujuan Keuangan', desc: 'Kami membantu menata prioritas dan menetapkan tenggat yang realistis untuk setiap tujuan, sehingga langkahmu punya arah yang jelas dan terukur.' },
      { title: 'Menyusun Strategi Capai Tujuan', desc: 'Kami merancang strategi alokasi investasi, proteksi aset, dan manajemen risiko yang disesuaikan dengan kemampuan dan profilmu, bukan pendekatan seragam.' },
      { title: 'Action Plan', desc: 'Kamu menerima laporan lengkap berupa PDF berisi hasil evaluasi, strategi investasi, rencana proteksi aset, dan catatan perbaikan yang bisa langsung diterapkan.' },
    ],
  },
  services: {
    eyebrow: 'LAYANAN KONSULTASI',
    title: 'Lebih dari Sekadar Mengatur Cashflow',
    subtitle:
      'Konsultasi perencanaan keuangan bersama kami memberikan pendampingan menyeluruh untuk mendekatkanmu pada setiap tujuan keuangan, lewat langkah yang terukur dan berkelanjutan.',
    items: [
      { title: 'Konsultasi Pinjaman Kredit Bank & Lembaga', desc: 'Kami menelaah opsi kredit seperti KPR, KKB, dan pinjaman jangka panjang lain, supaya kamu memilih dengan matang, mendapat opsi paling efisien, dan terhindar dari biaya tersembunyi.' },
      { title: 'Dana Pensiun', desc: 'Persiapan dana pensiun sekaligus strategi menuju kebebasan finansial. Cocok untukmu yang ingin keleluasaan pensiun lebih awal dengan rasa aman.' },
      { title: 'Dana Pendidikan', desc: 'Perencanaan kebutuhan pendidikan anak dengan skema proteksi aset dan strategi investasi optimal, agar masa depan pendidikan mereka lebih terjamin.' },
    ],
    cta: 'Jadwalkan Sesi Konsultasimu',
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Pertanyaan yang Sering Ditanyakan',
    items: [
      { q: 'Apa itu perencanaan keuangan?', a: 'Perencanaan keuangan adalah proses menata pengelolaan keuangan secara tepat dan terarah untuk mencapai tujuan hidupmu atau keluargamu. Prosesnya mencakup penyusunan dan penerapan rencana keuangan yang dibuat khusus, karena kondisi dan tujuan setiap orang berbeda.' },
      { q: 'Berapa biaya konsultasi keuangan?', a: 'Biaya disesuaikan dengan tahap hidup dan kompleksitas situasi keuanganmu. Paket Starter Rp500.000 (fresh graduate/single, 1 sesi 90 menit). Paket Family Rp1.000.000 (pasangan/keluarga muda, proses 2–3 minggu). Paket Comprehensive Rp2.000.000 (mapan/kompleks, proses ±1 bulan).' },
      { q: 'Berapa banyak sesi konsultasi yang dijalani?', a: 'Ada 2 sesi: initial meeting dan recommendation meeting.' },
      { q: 'Bagaimana timeline konsultasinya?', a: 'Minggu 1 — Initial Meeting. Minggu 2 — Penyampaian Data Keuangan. Minggu 3 — Recommendation Meeting.' },
      { q: 'Apakah konsultasi bisa bersama pasangan?', a: 'Bisa, sendiri maupun bersama pasangan, selama sesuai durasi dan layanan yang dipilih.' },
      { q: 'Bagaimana cara membeli jasa konsultasi secara online?', a: 'Daftar lewat halaman ini, pilih jadwal yang tersedia, isi datamu, pilih metode pembayaran, lalu kamu akan menerima email konfirmasi jadwal initial meeting. Usahakan hadir 5 menit sebelum sesi.' },
      { q: 'Kapan saja jadwal konsultasi tersedia?', a: 'Setiap hari, Senin–Minggu, pukul 09.00–20.00 WIB.' },
      { q: 'Apakah pembayaran bisa dicicil?', a: 'Untuk saat ini pembayaran belum bisa dicicil dan dilakukan penuh di awal.' },
      { q: 'Apakah bisa refund?', a: 'Refund bisa diajukan paling lambat H-2 sebelum jadwal, dengan pengembalian maksimal 50%. Jika konsultasi sudah berlangsung, refund tidak dapat dilakukan.' },
      { q: 'Bagaimana kerahasiaan data dan informasiku?', a: 'Perencana Keuangan (CFP®) kami terikat etika profesi dan prinsip kerahasiaan. Semua informasi yang kamu bagikan kami jaga dan hanya digunakan untuk kepentingan konsultasi.' },
    ],
  },
  booking: {
    steps: { schedule: 'Pilih Jadwal', details: 'Data Diri', confirm: 'Konfirmasi' },
    closed: {
      title: 'Booking sementara ditutup',
      body: 'Pendaftaran konsultasi sedang kami tutup sementara. Hubungi kami via WhatsApp untuk jadwal berikutnya.',
      cta: 'Hubungi via WhatsApp',
    },
    timeline: {
      title: 'Alur Konsultasi Bersama Kami',
      subtitle:
        'Biar kamu tahu apa yang akan kita jalani bareng — dari awal sampai kamu menerima rekomendasi. Santai, terarah, satu langkah dalam satu waktu.',
      items: [
        { week: 'Minggu 1', title: 'Initial Meeting (60 menit)', desc: 'Kita mulai dengan ngobrol soal gambaran kondisi keuanganmu, tujuan yang ingin dicapai, dan area yang bisa dioptimalkan.' },
        { week: 'Minggu 2', title: 'Penyampaian Data Keuangan', desc: 'Kamu melengkapi data keuangan yang dibutuhkan (via email), sebagai bahan analisis kami secara menyeluruh.' },
        { week: 'Minggu 3', title: 'Recommendation Meeting', desc: 'Setelah analisis selesai, kita bertemu lagi membahas rekomendasi yang kami susun khusus untukmu.' },
      ],
      note: 'Setiap tahap dirancang agar kamu punya cukup waktu memahami setiap langkah, tanpa terburu-buru.',
    },
    schedule: { dateLabel: 'Pilih Tanggal', timeLabel: 'Pilih Jam (WIB)', empty: 'Tidak ada jadwal tersedia.' },
    details: {
      nameLabel: 'Nama Lengkap',
      emailLabel: 'Email',
      phoneLabel: 'No. WhatsApp',
      topicLabel: 'Apa yang ingin kamu konsultasikan?',
      topicHint: 'Ceritakan singkat masalah atau tujuan keuangan yang ingin dibahas.',
    },
    confirm: {
      title: 'Tinjau Pesananmu',
      summaryDate: 'Tanggal',
      summaryTime: 'Jam',
      summaryName: 'Nama',
      summaryTopic: 'Topik',
      submit: 'Konfirmasi & Lihat Pembayaran',
    },
    success: {
      title: 'Booking diterima!',
      body: 'Booking-mu sudah kami catat. Selesaikan pembayaran dalam 24 jam, lalu kirim bukti transfer agar kami kirimkan link Google Meet ke emailmu.',
      refId: 'Nomor Referensi',
      payTitle: 'Instruksi Pembayaran',
      bankTransfer: 'Transfer Bank',
      qris: 'QRIS',
      copy: 'Salin',
      copied: 'Tersalin',
      window: 'Bayar dalam 24 jam. Jika belum dibayar, booking otomatis batal.',
      refund: 'Refund maksimal 50% bisa diajukan paling lambat H-2 sebelum jadwal.',
      whatsapp: 'Kendala pembayaran? Hubungi via WhatsApp',
    },
    next: 'Lanjut',
    back: 'Kembali',
  },
},
```

Add the same structure under `translations.en` with English values (draft — flag for user review). Example for the leaf strings; replicate every key:

```ts
// --- inside translations.en (same shape, English values) ---
konsultasi: {
  meta: { title: 'Personal Financial Consultation', description: '1-on-1 consultation with a certified Financial Planner to map your finances and build a strategy aligned with your goals.' },
  hero: {
    eyebrow: '1-ON-1 CONSULTATION',
    title: 'Personal Financial Consultation',
    subtitle: 'We start by mapping your finances and measuring your financial-health ratios, then build a strategy that fits your goals and situation.',
    cta: 'Schedule a Consultation',
    badges: [
      { title: 'Confidential & protected', desc: 'Your data is safe, your privacy respected' },
      { title: 'Reach your goals', desc: 'Your financial goals, achieved one by one' },
      { title: 'Resolutions achieved', desc: 'Financial resolutions, not just talk' },
      { title: 'Healthier finances', desc: 'Healthier money, a calmer mind' },
    ],
  },
  // ... replicate help / services / faq / booking with English copy ...
},
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (TypeScript will flag any key present in `id` but missing in `en` if the translations object is typed — ensure both shapes match exactly.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/translations.ts
git commit -m "feat(konsultasi): add ID/EN translations for service page + booking"
```

---

## Task 9: Service-page sections

**Files:**
- Create: `src/components/sections/konsultasi/KonsultasiHero.tsx`
- Create: `src/components/sections/konsultasi/BagaimanaKamiMembantu.tsx`
- Create: `src/components/sections/konsultasi/LayananKonsultasi.tsx`
- Create: `src/components/sections/konsultasi/KonsultasiFAQ.tsx`

All are `'use client'` (they read `useLang()`). Use design tokens from CLAUDE.md: page bg `#F0F7FA`, white cards w/ `#E0EBF5` border, navy `#153A56`, primary `#205781`, teal `#4F9DA6`, amber `#f79d35`, Outfit/JetBrains Mono. Reuse `Container`, `SectionHeader`, `Button` where they fit.

- [ ] **Step 1: KonsultasiHero**

```tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Target, CheckCircle2, HeartPulse } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

const ICONS = [ShieldCheck, Target, CheckCircle2, HeartPulse];

export const KonsultasiHero: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].konsultasi.hero;
  return (
    <section className="bg-[#F0F7FA] pt-32 pb-16">
      <Container>
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-[#205781] uppercase mb-4">{t.eyebrow}</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1A1918] tracking-[-1px] leading-[1.1] mb-5">{t.title}</h1>
          <p className="text-lg text-[#666666] leading-relaxed mb-8">{t.subtitle}</p>
          <Link href="/konsultasi/booking" className="inline-flex items-center rounded-full bg-[#f79d35] px-7 py-3.5 font-semibold text-white shadow-[0_8px_20px_rgba(247,157,53,0.35)]">{t.cta}</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {t.badges.map((b, i) => {
            const Icon = ICONS[i];
            return (
              <div key={b.title} className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
                <Icon className="w-6 h-6 text-[#4F9DA6] mb-3" />
                <p className="font-semibold text-[15px] text-[#1A1918] mb-1">{b.title}</p>
                <p className="text-[13px] text-[#666666] leading-snug">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
```

- [ ] **Step 2: BagaimanaKamiMembantu** (4 cards, light section)

```tsx
'use client';
import React from 'react';
import { ClipboardCheck, Flag, Route, FileText } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

const ICONS = [ClipboardCheck, Flag, Route, FileText];

export const BagaimanaKamiMembantu: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].konsultasi.help;
  return (
    <section className="bg-[#F0F7FA] py-20">
      <Container>
        <SectionHeader badgeVariant="light" title={<span className="text-[#1A1918]">{t.title}</span>} subtitle={t.subtitle} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {t.items.map((it, i) => {
            const Icon = ICONS[i];
            return (
              <div key={it.title} className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-7">
                <div className="w-12 h-12 rounded-2xl bg-[#E0EBF5] flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-[#205781]" /></div>
                <h3 className="text-[18px] font-semibold text-[#1A1918] mb-2">{it.title}</h3>
                <p className="text-[14px] text-[#666666] leading-relaxed">{it.desc}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
```

- [ ] **Step 3: LayananKonsultasi** (3 cards, dark navy section for contrast)

```tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { Landmark, PiggyBank, GraduationCap } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

const ICONS = [Landmark, PiggyBank, GraduationCap];

export const LayananKonsultasi: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].konsultasi.services;
  return (
    <section className="bg-[#153A56] py-20">
      <Container>
        <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-[#8AD6C1] uppercase mb-4">{t.eyebrow}</p>
        <h2 className="text-3xl font-extrabold text-white tracking-[-0.8px] mb-3 max-w-2xl">{t.title}</h2>
        <p className="text-[#9C9B99] max-w-2xl mb-12">{t.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.items.map((it, i) => {
            const Icon = ICONS[i];
            return (
              <div key={it.title} className="bg-[#1A3A50] rounded-2xl p-7">
                <Icon className="w-7 h-7 text-[#4F9DA6] mb-4" />
                <h3 className="text-[18px] font-semibold text-white mb-2">{it.title}</h3>
                <p className="text-[14px] text-[#9C9B99] leading-relaxed">{it.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-12">
          <Link href="/konsultasi/booking" className="inline-flex items-center rounded-full bg-[#f79d35] px-7 py-3.5 font-semibold text-white shadow-[0_8px_20px_rgba(247,157,53,0.35)]">{t.cta}</Link>
        </div>
      </Container>
    </section>
  );
};
```

- [ ] **Step 4: KonsultasiFAQ** (accordion)

```tsx
'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

export const KonsultasiFAQ: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].konsultasi.faq;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-[#F0F7FA] py-20">
      <Container>
        <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-[#205781] uppercase mb-4">{t.eyebrow}</p>
        <h2 className="text-3xl font-extrabold text-[#1A1918] tracking-[-0.8px] mb-10">{t.title}</h2>
        <div className="flex flex-col gap-3 max-w-3xl">
          {t.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="bg-white rounded-2xl border border-[#E0EBF5] overflow-hidden">
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                  <span className="font-semibold text-[15px] text-[#1A1918]">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#205781] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <p className="px-5 pb-5 text-[14px] text-[#666666] leading-relaxed">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
```

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/konsultasi/
git commit -m "feat(konsultasi): add service-page sections"
```

---

## Task 10: Service detail page

**Files:**
- Create: `src/app/konsultasi/page.tsx`

- [ ] **Step 1: Write the page (server component, static metadata in ID)**

```tsx
import React from 'react';
import { Metadata } from 'next';
import { KonsultasiHero } from '@/components/sections/konsultasi/KonsultasiHero';
import { BagaimanaKamiMembantu } from '@/components/sections/konsultasi/BagaimanaKamiMembantu';
import { LayananKonsultasi } from '@/components/sections/konsultasi/LayananKonsultasi';
import { KonsultasiFAQ } from '@/components/sections/konsultasi/KonsultasiFAQ';

export const metadata: Metadata = {
  title: 'Konsultasi Keuangan Pribadi',
  description:
    'Konsultasi 1-on-1 bersama Perencana Keuangan bersertifikat untuk memetakan kondisi keuanganmu dan menyusun strategi yang sesuai dengan tujuanmu.',
};

export default function KonsultasiPage() {
  return (
    <main>
      <KonsultasiHero />
      <BagaimanaKamiMembantu />
      <LayananKonsultasi />
      <KonsultasiFAQ />
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, open `http://localhost:3000/konsultasi`.
Expected: all four sections render, ID/EN toggle works via the language switcher, CTAs link to `/konsultasi/booking`, styling matches the design system (no blue/gray legacy look).

- [ ] **Step 3: Commit**

```bash
git add src/app/konsultasi/page.tsx
git commit -m "feat(konsultasi): add /konsultasi service detail page"
```

---

## Task 11: Booking flow client component

**Files:**
- Create: `src/app/konsultasi/booking/BookingFlow.tsx`

The wizard receives server-computed data as props: selectable dates, a date→slots map, the availability `enabled` flag, and `PaymentDisplay`. This keeps `server-only` modules out of the client bundle.

- [ ] **Step 1: Write the component**

```tsx
'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Copy } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';
import { EMPTY_BOOKING, type BookingForm, type BookingStep } from './lib/types';
import type { PaymentDisplay } from '@/lib/konsultasi-payment';

type Props = {
  enabled: boolean;
  dates: string[];
  slotsByDate: Record<string, string[]>;
  payment: PaymentDisplay;
};

const STEP_ORDER: BookingStep[] = ['schedule', 'details', 'confirm'];

export default function BookingFlow({ enabled, dates, slotsByDate, payment }: Props) {
  const { lang } = useLang();
  const t = translations[lang].konsultasi.booking;
  const [step, setStep] = useState<BookingStep>('schedule');
  const [form, setForm] = useState<BookingForm>(EMPTY_BOOKING);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const slots = useMemo(() => (form.date ? slotsByDate[form.date] ?? [] : []), [form.date, slotsByDate]);
  const set = (patch: Partial<BookingForm>) => setForm((f) => ({ ...f, ...patch }));

  if (!enabled) {
    return (
      <Container>
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#E0EBF5] p-10 text-center">
          <h1 className="text-2xl font-extrabold text-[#1A1918] mb-3">{t.closed.title}</h1>
          <p className="text-[#666666] mb-6">{t.closed.body}</p>
          <a href={payment.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-[#f79d35] px-6 py-3 font-semibold text-white">{t.closed.cta}</a>
        </div>
      </Container>
    );
  }

  if (bookingId) {
    const copy = (val: string) => { navigator.clipboard.writeText(val); setCopied(val); setTimeout(() => setCopied(null), 1500); };
    return (
      <Container>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E0EBF5] p-8">
          <h1 className="text-2xl font-extrabold text-[#1A1918] mb-2">{t.success.title}</h1>
          <p className="text-[#666666] mb-4">{t.success.body}</p>
          <p className="text-[13px] text-[#666666] mb-6">{t.success.refId}: <span className="font-mono font-bold text-[#205781]">{bookingId}</span></p>
          <h2 className="font-semibold text-[#1A1918] mb-3">{t.success.payTitle}</h2>
          <p className="text-[13px] font-semibold text-[#3A5A70] mb-2">{t.success.bankTransfer}</p>
          <div className="flex flex-col gap-2 mb-5">
            {payment.banks.map((b) => (
              <div key={b.accountNumber} className="flex items-center justify-between bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] px-4 py-3">
                <div><p className="text-[13px] text-[#666666]">{b.label} · {b.accountName}</p><p className="font-mono font-bold text-[#1A1918]">{b.accountNumber}</p></div>
                <button type="button" onClick={() => copy(b.accountNumber)} className="text-[#205781] flex items-center gap-1 text-[13px]">{copied === b.accountNumber ? <><Check className="w-4 h-4" />{t.success.copied}</> : <><Copy className="w-4 h-4" />{t.success.copy}</>}</button>
              </div>
            ))}
          </div>
          <p className="text-[13px] font-semibold text-[#3A5A70] mb-2">{t.success.qris}</p>
          <div className="flex items-center gap-4 mb-5">
            <Image src={payment.qrisImageSrc} alt="QRIS" width={140} height={140} className="rounded-xl border border-[#E0EBF5]" />
            <p className="text-[13px] text-[#666666]">{payment.qrisName}</p>
          </div>
          <div className="bg-[#FFF8E1] text-[#D97706] text-[13px] rounded-[10px] px-4 py-3 mb-2">{t.success.window}</div>
          <p className="text-[12px] text-[#666666] mb-5">{t.success.refund}</p>
          <a href={payment.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full border border-[#205781] text-[#205781] px-6 py-3 font-semibold">{t.success.whatsapp}</a>
        </div>
      </Container>
    );
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const canNext =
    (step === 'schedule' && form.date && form.timeSlot) ||
    (step === 'details' && form.name.trim().length >= 2 && /.+@.+\..+/.test(form.email) && form.topic.trim().length >= 10);

  const submit = async () => {
    setSubmitting(true); setError(null);
    try {
      const res = await fetch('/api/konsultasi/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal');
      setBookingId(data.bookingId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal');
    } finally { setSubmitting(false); }
  };

  const input = 'h-[48px] w-full bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] px-4 outline-none focus:ring-2 focus:ring-[#f79d35]/40 focus:border-[#f79d35]';
  const label = 'block text-[13px] font-semibold text-[#3A5A70] mb-1.5';

  return (
    <Container>
      <div className="max-w-2xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className={`flex-1 text-center text-[13px] font-semibold rounded-full py-2 ${i === stepIndex ? 'bg-[#205781] text-white' : i < stepIndex ? 'bg-[#4F9DA6] text-white' : 'bg-[#E0EBF5] text-[#666666]'}`}>{t.steps[s]}</div>
          ))}
        </div>

        {step === 'schedule' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6">
              <h2 className="font-extrabold text-[#1A1918] text-xl mb-1">{t.timeline.title}</h2>
              <p className="text-[14px] text-[#666666] mb-5">{t.timeline.subtitle}</p>
              <div className="flex flex-col gap-4">
                {t.timeline.items.map((it) => (
                  <div key={it.week} className="flex gap-4">
                    <span className="font-mono text-[11px] font-bold text-[#205781] uppercase w-20 shrink-0 pt-1">{it.week}</span>
                    <div><p className="font-semibold text-[15px] text-[#1A1918]">{it.title}</p><p className="text-[13px] text-[#666666]">{it.desc}</p></div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#9C9B99] mt-4">{t.timeline.note}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6">
              <label className={label}>{t.schedule.dateLabel}</label>
              {dates.length === 0 ? <p className="text-[14px] text-[#666666]">{t.schedule.empty}</p> : (
                <select className={input} value={form.date} onChange={(e) => set({ date: e.target.value, timeSlot: '' })}>
                  <option value="">—</option>
                  {dates.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
              {form.date && (
                <div className="mt-4">
                  <label className={label}>{t.schedule.timeLabel}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((s) => (
                      <button key={s} type="button" onClick={() => set({ timeSlot: s })} className={`py-2 rounded-[10px] text-[14px] border ${form.timeSlot === s ? 'bg-[#205781] text-white border-[#205781]' : 'bg-[#F5F8FC] border-[#CBDCEA] text-[#1A1918]'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6 flex flex-col gap-4">
            <div><label className={label}>{t.details.nameLabel}</label><input className={input} value={form.name} onChange={(e) => set({ name: e.target.value })} /></div>
            <div><label className={label}>{t.details.emailLabel}</label><input type="email" className={input} value={form.email} onChange={(e) => set({ email: e.target.value })} /></div>
            <div><label className={label}>{t.details.phoneLabel}</label><input className={input} value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></div>
            <div>
              <label className={label}>{t.details.topicLabel}</label>
              <textarea className="w-full min-h-[120px] bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] p-4 outline-none focus:ring-2 focus:ring-[#f79d35]/40 focus:border-[#f79d35]" value={form.topic} onChange={(e) => set({ topic: e.target.value })} />
              <p className="text-[11px] text-[#9BAFC0] mt-1">{t.details.topicHint}</p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6">
            <h2 className="font-extrabold text-[#1A1918] text-xl mb-4">{t.confirm.title}</h2>
            <dl className="flex flex-col gap-2 text-[14px]">
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryDate}</dt><dd className="font-semibold text-[#1A1918]">{form.date}</dd></div>
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryTime}</dt><dd className="font-semibold text-[#1A1918]">{form.timeSlot} WIB</dd></div>
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryName}</dt><dd className="font-semibold text-[#1A1918]">{form.name}</dd></div>
              <div className="flex justify-between gap-6"><dt className="text-[#666666] shrink-0">{t.confirm.summaryTopic}</dt><dd className="text-[#1A1918] text-right">{form.topic}</dd></div>
            </dl>
            {error && <p className="text-[#8C1C00] text-[13px] mt-4">{error}</p>}
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between mt-6">
          <button type="button" disabled={stepIndex === 0} onClick={() => setStep(STEP_ORDER[stepIndex - 1])} className="rounded-full border border-[#CBDCEA] px-6 py-3 font-semibold text-[#3A5A70] disabled:opacity-40">{t.back}</button>
          {step === 'confirm' ? (
            <button type="button" disabled={submitting} onClick={submit} className="rounded-full bg-[#f79d35] px-7 py-3 font-semibold text-white disabled:opacity-50">{t.confirm.submit}</button>
          ) : (
            <button type="button" disabled={!canNext} onClick={() => setStep(STEP_ORDER[stepIndex + 1])} className="rounded-full bg-[#205781] px-7 py-3 font-semibold text-white disabled:opacity-40">{t.next}</button>
          )}
        </div>

        <p className="text-center mt-6 text-[13px] text-[#666666]"><Link href="/konsultasi" className="underline">&larr; {translations[lang].konsultasi.hero.title}</Link></p>
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/konsultasi/booking/BookingFlow.tsx
git commit -m "feat(konsultasi): add 3-step booking wizard component"
```

---

## Task 12: Booking page (server data wiring)

**Files:**
- Create: `src/app/konsultasi/booking/page.tsx`

- [ ] **Step 1: Write the page (computes availability + payment data server-side)**

```tsx
import React from 'react';
import { Metadata } from 'next';
import BookingFlow from './BookingFlow';
import { BOOKING_AVAILABILITY } from '@/lib/booking-availability';
import { getSelectableDates, getSlotsForDate } from './lib/availability';
import { getPaymentDisplay } from '@/lib/konsultasi-payment';

export const metadata: Metadata = {
  title: 'Booking Konsultasi Keuangan',
  description: 'Jadwalkan sesi konsultasi keuangan 1-on-1 bersama Perencana Keuangan bersertifikat.',
};

export const dynamic = 'force-dynamic'; // dates depend on "today"

export default function BookingPage() {
  const today = new Date();
  const dates = getSelectableDates(BOOKING_AVAILABILITY, today);
  const slotsByDate: Record<string, string[]> = {};
  for (const d of dates) slotsByDate[d] = getSlotsForDate(BOOKING_AVAILABILITY, d);

  return (
    <main className="bg-[#F0F7FA] min-h-screen pt-32 pb-20">
      <BookingFlow
        enabled={BOOKING_AVAILABILITY.enabled}
        dates={dates}
        slotsByDate={slotsByDate}
        payment={getPaymentDisplay()}
      />
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, open `http://localhost:3000/konsultasi/booking`.
Expected: stepper shows 3 steps; Step 1 timeline + date dropdown (populated) + slot grid; Next is disabled until date+slot chosen; Step 2 validates name/email/topic; Step 3 summary; submit posts and shows the success/payment panel with a `KB-...` reference. Toggle `BOOKING_AVAILABILITY.enabled = false` and confirm the "closed" notice renders. ID/EN toggle works.

- [ ] **Step 3: Commit**

```bash
git add src/app/konsultasi/booking/page.tsx
git commit -m "feat(konsultasi): add /konsultasi/booking page wiring"
```

---

## Task 13: Add QRIS placeholder asset

**Files:**
- Create: `public/konsultasi-qris.png`

- [ ] **Step 1: Add a placeholder image**

Create a 1x1 transparent (or simple placeholder) PNG so `next/image` resolves during dev. The user replaces it with the real QRIS later.

Run:
```bash
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82' > public/konsultasi-qris.png
```
Expected: a tiny valid PNG exists at `public/konsultasi-qris.png`.

- [ ] **Step 2: Commit**

```bash
git add public/konsultasi-qris.png
git commit -m "chore(konsultasi): add placeholder QRIS image"
```

---

## Task 14: Wire the home Services card to /konsultasi

**Files:**
- Modify: `src/components/sections/Services.tsx`

- [ ] **Step 1: Re-point the consultation card CTA**

In `src/components/sections/Services.tsx`, the consultation `ServiceInfoCard` currently has `cta={{ label: 'Financial Health Check', href: '/financial-health-check' }}`. Change it to direct users to the new service page:

```tsx
cta={{ label: 'Pelajari Konsultasi', href: '/konsultasi' }}
```

(Keep the Financial Health Check accessible elsewhere — it remains its own route. If the team wants both CTAs, that is a follow-up, not part of this plan.)

- [ ] **Step 2: Verify**

Run `npm run dev`, open home page, confirm the Konsultasi Keuangan card links to `/konsultasi`.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Services.tsx
git commit -m "feat(konsultasi): link home consultation card to /konsultasi"
```

---

## Task 15: Final verification

- [ ] **Step 1: Run unit tests**

Run: `npm test`
Expected: all availability tests PASS.

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors introduced by this feature.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds; `/konsultasi` and `/konsultasi/booking` appear in the route output.

- [ ] **Step 4: Manual end-to-end pass**

- `/konsultasi`: all sections, ID/EN, CTAs, mobile layout vs design.
- `/konsultasi/booking`: full happy path → Sheets row appears with status `Pending`; closed-state notice; invalid-slot rejection (400).
- Compare visuals against design nodes `baG1y`, `ICbdI`, `4rk7V`, `PpzHi`.

- [ ] **Step 5: Flag follow-ups to the user**

- Replace `public/konsultasi-qris.png` with the real QRIS.
- Review/approve EN translations.
- Set `GOOGLE_KONSULTASI_TAB` env if a non-default tab name is desired; ensure the "Konsultasi Bookings" tab exists / service account has write access.

---

## Self-Review Notes

- **Spec coverage:** service page (Tasks 9–10), booking flow 3 steps (Tasks 11–12), configurable availability + master toggle (Tasks 2–3, 12), offline payment panel + WhatsApp + 24h note + refund (Tasks 6, 11), Google Sheets storage (Tasks 5, 7), zod + server-side slot re-validation (Task 7), i18n ID/EN (Task 8), QRIS asset (Task 13), home card wiring (Task 14), tests/build (Tasks 1, 3, 15). All spec sections map to a task.
- **Type consistency:** `BookingForm`/`BookingStep` (Task 4) consumed unchanged in Task 11; `PaymentDisplay` (Task 6) consumed in Tasks 11–12; `BookingAvailability` (Task 2) consumed in Tasks 3, 7, 12; `getSelectableDates`/`getSlotsForDate`/`isValidSlot` names consistent across Tasks 3, 7, 12.
- **No online payment, no email, no double-booking** — deliberately out of scope per spec Non-Goals.
