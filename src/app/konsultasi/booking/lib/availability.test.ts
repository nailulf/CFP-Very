import { describe, it, expect } from 'vitest';
import {
  toISODate,
  getSelectableDates,
  getSlotsForDate,
  isValidSlot,
  slotIntervalUTC,
  parseBookingDateCell,
  filterFreeSlots,
  type BusyInterval,
} from './availability';
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

describe('slotIntervalUTC', () => {
  it('converts a WIB slot to UTC ms (10:00 WIB → 03:00Z)', () => {
    const { startMs, endMs } = slotIntervalUTC('2026-06-18', '10:00', 60);
    expect(new Date(startMs).toISOString()).toBe('2026-06-18T03:00:00.000Z');
    expect(new Date(endMs).toISOString()).toBe('2026-06-18T04:00:00.000Z');
  });
});

describe('parseBookingDateCell', () => {
  it('parses 24h format', () => {
    expect(parseBookingDateCell('2026-06-18 10:00')).toEqual({ date: '2026-06-18', time: '10:00' });
  });

  it('parses legacy 12h PM format', () => {
    expect(parseBookingDateCell('2026-05-15 1:00 PM')).toEqual({ date: '2026-05-15', time: '13:00' });
  });

  it('handles 12 AM (midnight) and 12 PM (noon)', () => {
    expect(parseBookingDateCell('2026-05-15 12:00 AM')).toEqual({ date: '2026-05-15', time: '00:00' });
    expect(parseBookingDateCell('2026-05-15 12:00 PM')).toEqual({ date: '2026-05-15', time: '12:00' });
  });

  it('returns null for unparseable / empty cells', () => {
    expect(parseBookingDateCell('')).toBeNull();
    expect(parseBookingDateCell('not a date')).toBeNull();
    expect(parseBookingDateCell('2026-13-99')).toBeNull();
  });
});

describe('filterFreeSlots', () => {
  const slots = ['09:00', '10:00', '11:00', '12:00'];

  it('removes already-booked slots', () => {
    const booked = new Set(['2026-06-18 10:00']);
    expect(filterFreeSlots(slots, '2026-06-18', 60, booked, [])).toEqual(['09:00', '11:00', '12:00']);
  });

  it('removes slots overlapping a calendar busy interval', () => {
    // 11:00–12:00 WIB = 04:00–05:00Z busy
    const busy: BusyInterval[] = [{ start: '2026-06-18T04:00:00Z', end: '2026-06-18T05:00:00Z' }];
    expect(filterFreeSlots(slots, '2026-06-18', 60, new Set(), busy)).toEqual(['09:00', '10:00', '12:00']);
  });

  it('keeps a slot that only touches a busy boundary', () => {
    // Busy 10:00–11:00 WIB (03:00–04:00Z); 11:00 slot starts exactly at busy end → free
    const busy: BusyInterval[] = [{ start: '2026-06-18T03:00:00Z', end: '2026-06-18T04:00:00Z' }];
    const free = filterFreeSlots(slots, '2026-06-18', 60, new Set(), busy);
    expect(free).toContain('11:00');
    expect(free).not.toContain('10:00');
  });

  it('removes a slot on partial overlap', () => {
    // Busy 10:30–10:45 WIB sits inside the 10:00 slot → removed
    const busy: BusyInterval[] = [{ start: '2026-06-18T03:30:00Z', end: '2026-06-18T03:45:00Z' }];
    expect(filterFreeSlots(slots, '2026-06-18', 60, new Set(), busy)).not.toContain('10:00');
  });
});
