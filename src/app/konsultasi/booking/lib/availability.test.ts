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
