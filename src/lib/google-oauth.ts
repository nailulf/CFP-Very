import 'server-only';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

/** Thrown when the OAuth env vars aren't set — callers treat this as "feature off". */
export class OAuthNotConfigured extends Error {
  constructor() {
    super('Google OAuth is not configured (missing GOOGLE_OAUTH_* env vars).');
    this.name = 'OAuthNotConfigured';
  }
}

type CachedToken = { value: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

/** True when the owner-OAuth credentials are present. */
export function isOwnerOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
      process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  );
}

/**
 * Mint (and cache) an access token acting as the calendar owner, using the stored
 * refresh token. Lets us create events / Meet links / send invites as a real user —
 * things a service account can't do on a personal Google account.
 */
export async function getOwnerAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new OAuthNotConfigured();
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Google OAuth refresh failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}
