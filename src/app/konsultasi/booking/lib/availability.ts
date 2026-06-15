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

// ---------------------------------------------------------------------------
// Availability filtering: subtract already-booked + calendar-busy slots.
// All booking times are WIB (Asia/Jakarta, a fixed +07:00 with no DST).
// ---------------------------------------------------------------------------

const WIB_OFFSET = '+07:00';

/** A busy interval from Google Calendar, as ISO UTC timestamps. */
export type BusyInterval = { start: string; end: string };

/** UTC epoch-millisecond interval for a WIB slot `[start, start+slotMinutes)`. */
export function slotIntervalUTC(
  date: string,
  time: string,
  slotMinutes: number,
): { startMs: number; endMs: number } {
  const startMs = Date.parse(`${date}T${time}:00${WIB_OFFSET}`);
  return { startMs, endMs: startMs + slotMinutes * 60_000 };
}

/**
 * Parse an "Order" sheet Booking Date cell into normalized date + 24h time.
 * Handles "2026-06-18 10:00" (24h) and legacy "2026-05-15 1:00 PM" (12h).
 * Returns null when the cell can't be confidently parsed.
 */
export function parseBookingDateCell(cell: string): { date: string; time: string } | null {
  if (!cell) return null;
  const trimmed = cell.trim();
  const m = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?/,
  );
  if (!m) return null;
  const [, date, hStr, min, ampm] = m;
  let hour = Number(hStr);
  if (ampm) {
    const isPM = ampm.toLowerCase() === 'pm';
    if (hour === 12) hour = isPM ? 12 : 0;
    else if (isPM) hour += 12;
  }
  if (hour > 23 || Number(min) > 59) return null;
  return { date, time: `${String(hour).padStart(2, '0')}:${min}` };
}

/** Key used to match a booking against a generated slot. */
export function slotKey(date: string, time: string): string {
  return `${date} ${time}`;
}

/**
 * From the config-generated slots for one date, drop any that are already
 * booked or overlap a calendar busy interval. Pure — no I/O.
 */
export function filterFreeSlots(
  slots: string[],
  date: string,
  slotMinutes: number,
  bookedSet: Set<string>,
  busy: BusyInterval[],
): string[] {
  const busyMs = busy.map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) }));
  return slots.filter((time) => {
    if (bookedSet.has(slotKey(date, time))) return false;
    const { startMs, endMs } = slotIntervalUTC(date, time, slotMinutes);
    // Half-open overlap: touching boundaries do not conflict.
    return !busyMs.some((b) => startMs < b.end && endMs > b.start);
  });
}
