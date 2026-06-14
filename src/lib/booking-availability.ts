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
