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
