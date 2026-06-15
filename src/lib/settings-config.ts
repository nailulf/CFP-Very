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

// Partial: an admin may submit a subset of packages; the store merges over defaults.
export const pricingSchema = z.partialRecord(z.enum(KONSULTASI_PACKAGE_IDS), packagePriceSchema);

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
