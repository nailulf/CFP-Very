import 'server-only';
import type { BookingAvailability } from './booking-availability';
import {
  getSlotsForDate,
  isValidSlot,
  filterFreeSlots,
} from '@/app/konsultasi/booking/lib/availability';
import { getBookedSlots } from './konsultasi-store';
import { getCalendarBusy } from './google-calendar';

const WIB = '+07:00';

/** Booked set, fail-open: an Order-sheet outage returns an empty set, not an error. */
async function safeBookedSlots(): Promise<Set<string>> {
  try {
    return await getBookedSlots();
  } catch (error) {
    console.error('getBookedSlots error (failing open):', error);
    return new Set<string>();
  }
}

/**
 * Free slots per date — config-generated slots minus already-booked (Order sheet)
 * and calendar-busy times. Used to render the booking wizard.
 */
export async function getFreeSlotsByDate(
  config: BookingAvailability,
  dates: string[],
): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {};
  if (dates.length === 0) return out;

  const timeMin = `${dates[0]}T00:00:00${WIB}`;
  const timeMax = `${dates[dates.length - 1]}T23:59:59${WIB}`;

  const [booked, busy] = await Promise.all([safeBookedSlots(), getCalendarBusy(timeMin, timeMax)]);

  for (const date of dates) {
    out[date] = filterFreeSlots(getSlotsForDate(config, date), date, config.slotMinutes, booked, busy);
  }
  return out;
}

/**
 * Submit-time guard: is this exact slot still offered AND not taken? Prevents a
 * double-booking when a slot is claimed between page load and submit.
 */
export async function isSlotAvailable(
  config: BookingAvailability,
  date: string,
  time: string,
  today: Date,
): Promise<boolean> {
  if (!isValidSlot(config, date, time, today)) return false;

  const timeMin = `${date}T00:00:00${WIB}`;
  const timeMax = `${date}T23:59:59${WIB}`;
  const [booked, busy] = await Promise.all([safeBookedSlots(), getCalendarBusy(timeMin, timeMax)]);

  return filterFreeSlots([time], date, config.slotMinutes, booked, busy).length === 1;
}
