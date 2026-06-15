import 'server-only';
import { getGoogleAccessToken } from './google-auth';
import { getOwnerAccessToken, isOwnerOAuthConfigured } from './google-oauth';
import type { BusyInterval } from '@/app/konsultasi/booking/lib/availability';

const FREEBUSY_URL = 'https://www.googleapis.com/calendar/v3/freeBusy';
const CALENDAR_TZ = 'Asia/Jakarta';

// The consultant who hosts every session — auto-added to each event as an attendee
// (so it lands on her calendar with the Meet link). Override via env if needed.
const HOST_EMAIL = process.env.KONSULTASI_HOST_EMAIL || 'adityacleverina@gmail.com';

/**
 * Busy intervals on the booking calendar between two ISO timestamps.
 *
 * Fail-open: returns [] when GOOGLE_CALENDAR_ID is unset or the API errors, so a
 * calendar outage (or not-yet-configured calendar) never breaks booking — it
 * just means calendar conflicts aren't subtracted that request.
 */
export async function getCalendarBusy(
  timeMinISO: string,
  timeMaxISO: string,
): Promise<BusyInterval[]> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) return [];

  try {
    const token = await getGoogleAccessToken();
    const res = await fetch(FREEBUSY_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ timeMin: timeMinISO, timeMax: timeMaxISO, items: [{ id: calendarId }] }),
    });
    if (!res.ok) {
      throw new Error(`Calendar freeBusy failed (${res.status}): ${await res.text()}`);
    }
    const data = (await res.json()) as {
      calendars?: Record<string, { busy?: BusyInterval[] }>;
    };
    return data.calendars?.[calendarId]?.busy ?? [];
  } catch (error) {
    console.error('getCalendarBusy error (failing open):', error);
    return [];
  }
}

export type BookingEventInput = {
  /** 'YYYY-MM-DD' (WIB). */
  date: string;
  /** 'HH:mm' (WIB). */
  time: string;
  durationMinutes: number;
  summary: string;
  description: string;
  clientEmail: string;
};

export type BookingEventResult = { meetLink?: string; htmlLink?: string };

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** End time 'HH:mm' (WIB) for a slot, clamped to same-day (sessions are < a day). */
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

/**
 * Create a calendar event as the owner (OAuth), with a Google Meet link and the
 * client invited (Google sends a native cross-provider invite). Best-effort:
 * returns {} when OAuth isn't configured or the API errors, so booking never fails.
 */
export async function createBookingEvent(input: BookingEventInput): Promise<BookingEventResult> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId || !isOwnerOAuthConfigured()) return {};

  try {
    const token = await getOwnerAccessToken();
    const endTime = addMinutes(input.time, input.durationMinutes);
    const attendees: { email: string; responseStatus?: string }[] = [{ email: input.clientEmail }];
    if (HOST_EMAIL && HOST_EMAIL.toLowerCase() !== input.clientEmail.toLowerCase()) {
      attendees.push({ email: HOST_EMAIL, responseStatus: 'accepted' });
    }
    const body = {
      summary: input.summary,
      description: input.description,
      start: { dateTime: `${input.date}T${input.time}:00`, timeZone: CALENDAR_TZ },
      end: { dateTime: `${input.date}T${endTime}:00`, timeZone: CALENDAR_TZ },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: `kb-${input.date}-${input.time}-${input.clientEmail}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };
    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
      `?conferenceDataVersion=1&sendUpdates=all`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`events.insert failed (${res.status}): ${await res.text()}`);
    }
    const ev = (await res.json()) as {
      hangoutLink?: string;
      htmlLink?: string;
      conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] };
    };
    const meetLink =
      ev.hangoutLink ??
      ev.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri;
    return { meetLink, htmlLink: ev.htmlLink };
  } catch (error) {
    console.error('createBookingEvent error (booking still succeeds):', error);
    return {};
  }
}
