#!/usr/bin/env node
/**
 * Diagnose why a paid booking got no Calendar event / no Meet invite.
 *
 * Creating a booking event needs TWO different Google identities to agree about
 * ONE calendar, and they fail in different ways:
 *
 *   • owner OAuth (GOOGLE_OAUTH_REFRESH_TOKEN) does events.insert — needs
 *     *writer* access to GOOGLE_CALENDAR_ID. 404 = wrong account entirely,
 *     403 = the account can see the calendar but only as a reader.
 *   • the service account (GOOGLE_SERVICE_ACCOUNT_EMAIL) does the freeBusy read
 *     behind slot availability — needs *read* access to the same calendar.
 *
 * Both failures are silent in production: createBookingEvent is best-effort so a
 * Calendar outage never fails a booking, and getCalendarBusy fails open to [] so
 * availability just stops subtracting real conflicts. This script makes them loud.
 *
 * Usage:
 *   node scripts/check-calendar-config.mjs                  # uses .env.local
 *   node scripts/check-calendar-config.mjs .env.production  # check production
 *
 * To check production, pull it first:
 *   vercel env pull .env.production --environment=production
 *
 * The write test inserts a far-future event with NO attendees and
 * sendUpdates=none — nothing is emailed to anyone — then deletes it.
 */
import fs from 'node:fs';

const envFile = process.argv[2] || '.env.local';

function loadEnv(file) {
  const env = { ...process.env };
  if (!fs.existsSync(file)) {
    console.error(`! ${file} not found — falling back to the current environment.\n`);
    return env;
  }
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv(envFile);
const calendarId = env.GOOGLE_CALENDAR_ID;

const ok = (s) => `\x1b[32m${s}\x1b[0m`;
const bad = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

console.log(`\nReading config from ${envFile}\n`);

// ---------------------------------------------------------------- presence --
const required = [
  'GOOGLE_CALENDAR_ID',
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_OAUTH_REFRESH_TOKEN',
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
];
let missing = false;
console.log('Config present?');
for (const key of required) {
  const set = Boolean(env[key]);
  if (!set) missing = true;
  console.log(`  ${set ? ok('SET  ') : bad('UNSET')}  ${key}`);
}
console.log(`\n  GOOGLE_CALENDAR_ID = ${calendarId || bad('(unset)')}`);

// NEXT_PUBLIC_BASE_URL is not a calendar concern, but a localhost value here
// means every link in the production emails points at a dev machine.
const base = env.NEXT_PUBLIC_BASE_URL || env.MAYAR_PUBLIC_ORIGIN;
if (!base) {
  console.log(`  ${bad('!')} neither NEXT_PUBLIC_BASE_URL nor MAYAR_PUBLIC_ORIGIN is set — emails lose their links`);
} else if (/localhost|127\.0\.0\.1/.test(base)) {
  console.log(`  ${bad('!')} public origin is "${base}" — emails would link to a dev machine`);
} else {
  console.log(`  ${ok('OK')} public origin = ${base}`);
}

if (missing) {
  console.log(
    `\n${bad('Stop:')} createBookingEvent() returns early when any GOOGLE_OAUTH_* var or` +
      ' GOOGLE_CALENDAR_ID is missing — no event, no invite, no error.\n',
  );
  process.exit(1);
}

// ------------------------------------------------- owner OAuth: can write? --
console.log('\nOwner OAuth (creates the event + Meet link)');
const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: env.GOOGLE_OAUTH_CLIENT_ID,
    client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    refresh_token: env.GOOGLE_OAUTH_REFRESH_TOKEN,
  }),
});
if (!tokenRes.ok) {
  console.log(`  ${bad('FAIL')} refresh token rejected (${tokenRes.status}) — re-run scripts/google-oauth-setup.mjs`);
  console.log(dim(`  ${await tokenRes.text()}`));
  process.exit(1);
}
const { access_token: ownerToken, scope } = await tokenRes.json();
console.log(`  ${ok('OK')} token minted`);
console.log(`  ${dim(`scopes: ${scope}`)}`);

// Mirrors src/lib/google-calendar.ts, minus attendees and notifications.
const probe = {
  summary: '[probe] check-calendar-config — safe to delete',
  description: 'Inserted by scripts/check-calendar-config.mjs to verify write access.',
  start: { dateTime: '2030-01-01T03:00:00', timeZone: 'Asia/Jakarta' },
  end: { dateTime: '2030-01-01T04:00:00', timeZone: 'Asia/Jakarta' },
  conferenceData: {
    createRequest: {
      requestId: `probe-${Date.now()}`,
      conferenceSolutionKey: { type: 'hangoutsMeet' },
    },
  },
};
const insertRes = await fetch(
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
    '?conferenceDataVersion=1&sendUpdates=none',
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(probe),
  },
);
const inserted = await insertRes.json().catch(() => ({}));

let writeOk = false;
if (insertRes.status === 200) {
  const meet =
    inserted.hangoutLink ??
    inserted.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri;
  if (meet) {
    writeOk = true;
    console.log(`  ${ok('OK')} events.insert succeeded, Meet link attached (${meet})`);
  } else {
    console.log(`  ${bad('WARN')} event created but NO Meet link — bookings would get an event with no join URL`);
  }
  const del = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${inserted.id}?sendUpdates=none`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${ownerToken}` } },
  );
  console.log(
    del.status === 204
      ? `  ${dim('probe event deleted')}`
      : `  ${bad('!')} could not delete the probe event — remove it by hand: ${inserted.htmlLink}`,
  );
} else if (insertRes.status === 404) {
  console.log(`  ${bad('FAIL 404')} this account cannot see "${calendarId}" at all — wrong Google account.`);
  console.log('         Either point GOOGLE_CALENDAR_ID at a calendar this account owns,');
  console.log('         or re-run scripts/google-oauth-setup.mjs signed in as the calendar owner.');
} else if (insertRes.status === 403) {
  console.log(`  ${bad('FAIL 403')} read-only on "${calendarId}" — ${inserted.error?.message ?? ''}`);
  console.log('         In Google Calendar, share that calendar with this account as');
  console.log('         "Make changes to events" (not "See all event details").');
} else {
  console.log(`  ${bad(`FAIL ${insertRes.status}`)} ${inserted.error?.message ?? '(no message)'}`);
}

// ------------------------------------- service account: can read free/busy? --
console.log('\nService account (slot availability / free-busy)');
const crypto = await import('node:crypto');
const b64u = (b) =>
  (typeof b === 'string' ? Buffer.from(b) : b)
    .toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
const iat = Math.floor(Date.now() / 1000);
const header = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
const claims = b64u(
  JSON.stringify({
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: iat + 3600,
    iat,
  }),
);
const signer = crypto.createSign('RSA-SHA256');
signer.update(`${header}.${claims}`);
signer.end();
const jwt = `${header}.${claims}.${b64u(signer.sign(env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')))}`;

let readOk = false;
const saRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  }),
});
if (!saRes.ok) {
  console.log(`  ${bad('FAIL')} service-account token exchange failed (${saRes.status})`);
} else {
  const { access_token: saToken } = await saRes.json();
  const fb = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${saToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 86_400_000).toISOString(),
      items: [{ id: calendarId }],
    }),
  });
  const err = (await fb.json().catch(() => ({})))?.calendars?.[calendarId]?.errors?.[0]?.reason;
  if (!err) {
    readOk = true;
    console.log(`  ${ok('OK')} ${env.GOOGLE_SERVICE_ACCOUNT_EMAIL} can read free/busy`);
  } else {
    console.log(`  ${bad(`FAIL (${err})`)} availability cannot see this calendar.`);
    console.log('         getCalendarBusy() fails open to [], so booked slots stop being');
    console.log(`         blocked — customers can double-book. Share the calendar with`);
    console.log(`         ${env.GOOGLE_SERVICE_ACCOUNT_EMAIL} (read access is enough).`);
  }
}

// ------------------------------------------------------------------ verdict --
console.log(
  `\n${writeOk && readOk ? ok('PASS') : bad('FAIL')} — invites ${writeOk ? 'will' : 'will NOT'} be created; ` +
    `availability ${readOk ? 'sees' : 'is BLIND to'} this calendar.\n`,
);
process.exit(writeOk && readOk ? 0 : 1);
