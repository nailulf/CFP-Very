import { google } from 'googleapis';

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

function getCalendar() {
  return google.calendar({ version: 'v3', auth: getAuth() });
}

export interface TimeSlot {
  start: string; // ISO string
  end: string;   // ISO string
  display: string; // e.g. "10:00 AM"
}

/**
 * Get available time slots for a specific date.
 * Checks Google Calendar for existing events and returns open 30-min slots
 * within working hours (09:00 - 17:00 WIB / UTC+7).
 */
export async function getAvailableSlots(date: string): Promise<TimeSlot[]> {
  const calendar = getCalendar();

  // Parse date and set working hours in WIB (UTC+7)
  const dayStart = new Date(`${date}T09:00:00+07:00`);
  const dayEnd = new Date(`${date}T17:00:00+07:00`);

  // Check if the date is a weekend
  const dayOfWeek = dayStart.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return []; // No slots on weekends
  }

  // Check if the date is in the past
  if (dayStart < new Date()) {
    return [];
  }

  // Fetch existing events for the day
  const response = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: dayStart.toISOString(),
    timeMax: dayEnd.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const busyPeriods = (response.data.items || []).map((event) => ({
    start: new Date(event.start?.dateTime || event.start?.date || ''),
    end: new Date(event.end?.dateTime || event.end?.date || ''),
  }));

  // Generate 30-minute slots within working hours
  const slots: TimeSlot[] = [];
  const slotDuration = 30 * 60 * 1000; // 30 minutes in ms
  let current = dayStart.getTime();

  while (current + slotDuration <= dayEnd.getTime()) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current + slotDuration);

    // Check if slot overlaps with any busy period
    const isAvailable = !busyPeriods.some(
      (busy) => slotStart < busy.end && slotEnd > busy.start
    );

    if (isAvailable) {
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        display: slotStart.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Jakarta',
        }),
      });
    }

    current += slotDuration;
  }

  return slots;
}

/**
 * Get available dates for a given month.
 * Returns an array of date strings (YYYY-MM-DD) that have at least one open slot.
 */
export async function getAvailableDates(year: number, month: number): Promise<string[]> {
  const calendar = getCalendar();

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));

  // Fetch all events for the month
  const response = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: monthStart.toISOString(),
    timeMax: monthEnd.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items || [];

  // Build a map of busy hours per day
  const busyByDate = new Map<string, { start: Date; end: Date }[]>();
  for (const event of events) {
    const start = new Date(event.start?.dateTime || event.start?.date || '');
    const dateKey = start.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD
    if (!busyByDate.has(dateKey)) {
      busyByDate.set(dateKey, []);
    }
    busyByDate.get(dateKey)!.push({
      start,
      end: new Date(event.end?.dateTime || event.end?.date || ''),
    });
  }

  const availableDates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Skip past dates
    if (date < today) continue;

    // Skip weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Check if there's at least one free 30-min slot in working hours
    const busyPeriods = busyByDate.get(dateStr) || [];
    const dayStart = new Date(`${dateStr}T09:00:00+07:00`);
    const dayEnd = new Date(`${dateStr}T17:00:00+07:00`);
    const slotDuration = 30 * 60 * 1000;

    let current = dayStart.getTime();
    let hasSlot = false;

    while (current + slotDuration <= dayEnd.getTime()) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current + slotDuration);

      const isFree = !busyPeriods.some(
        (busy) => slotStart < busy.end && slotEnd > busy.start
      );

      if (isFree) {
        hasSlot = true;
        break;
      }
      current += slotDuration;
    }

    if (hasSlot) {
      availableDates.push(dateStr);
    }
  }

  return availableDates;
}

/**
 * Create a Google Calendar event and send an invite to the client.
 */
export async function createCalendarEvent(params: {
  summary: string;
  description: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  attendeeEmail: string;
  attendeeName: string;
}): Promise<{ eventId: string; meetLink: string | null }> {
  const calendar = getCalendar();

  // Create event without Google Meet (service accounts on personal Gmail can't create Meet links)
  const event = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: params.summary,
      description: `${params.description}\n\nClient: ${params.attendeeName}\nEmail: ${params.attendeeEmail}`,
      start: {
        dateTime: params.startTime,
        timeZone: 'Asia/Jakarta',
      },
      end: {
        dateTime: params.endTime,
        timeZone: 'Asia/Jakarta',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    },
  });

  console.log('Calendar event created:', event.data.id);

  return {
    eventId: event.data.id || '',
    meetLink: null,
  };
}
