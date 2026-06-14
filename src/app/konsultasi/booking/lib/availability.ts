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
