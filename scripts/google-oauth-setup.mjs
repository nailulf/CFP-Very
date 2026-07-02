#!/usr/bin/env node
/**
 * One-time Google OAuth consent → refresh token, for acting as the calendar owner
 * (create events, Meet links, send invites). Run once; paste the printed values
 * into .env.local.
 *
 * Prereqs (Google Cloud console):
 *   1. OAuth consent screen (External, Testing) — add yourself as a test user,
 *      add scopes .../auth/calendar.events and .../auth/drive.file
 *   2. Credentials → Create OAuth client ID → "Desktop app" → copy Client ID + Secret
 *
 * Usage:
 *   node scripts/google-oauth-setup.mjs <CLIENT_ID> <CLIENT_SECRET>
 */
import http from 'node:http';
import crypto from 'node:crypto';

const clientId = process.argv[2] || process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.argv[3] || process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Usage: node scripts/google-oauth-setup.mjs <CLIENT_ID> <CLIENT_SECRET>');
  process.exit(1);
}

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}`;
const SCOPE = [
  'https://www.googleapis.com/auth/calendar.events',
  // Full Drive — needed to upload into a specific pre-existing folder (by ID).
  'https://www.googleapis.com/auth/drive',
].join(' ');
const STATE = crypto.randomBytes(8).toString('hex');

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state: STATE,
  }).toString();

async function exchange(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString(),
  });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);
  return res.json();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code) {
    res.writeHead(400).end('Missing code');
    return;
  }
  if (state !== STATE) {
    res.writeHead(400).end('State mismatch');
    return;
  }
  try {
    const tokens = await exchange(code);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h2>Done. You can close this tab and return to the terminal.</h2>');
    console.log('\n✅ Success. Add these to .env.local:\n');
    console.log(`GOOGLE_OAUTH_CLIENT_ID=${clientId}`);
    console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${clientSecret}`);
    console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
    if (!tokens.refresh_token) {
      console.log(
        '\n⚠️  No refresh_token returned. Remove this app from https://myaccount.google.com/permissions and rerun (prompt=consent forces it).',
      );
    }
    console.log('');
    server.close(() => process.exit(0));
  } catch (err) {
    res.writeHead(500).end('Token exchange failed; see terminal.');
    console.error(err);
    server.close(() => process.exit(1));
  }
});

server.listen(PORT, () => {
  console.log('\nOpen this URL in your browser and grant access:\n');
  console.log(authUrl);
  console.log(`\nWaiting for the redirect on ${REDIRECT_URI} ...`);
});
