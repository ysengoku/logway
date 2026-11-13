import { encrypt, decrypt } from './encrypt.js';
import {
  SESSION_ABSOLUTE_TIMEOUT_MS,
  SESSION_IDLE_TIMEOUT_MS,
  parseCookie,
  serializeCookie,
} from './cookies.js';

interface SessionPayload {
  token: string;
  issuedAt: number;
  lastActivity: number;
}
interface RefreshTokenData {
  token: string;
  issuedAt: number;
}

const REFRESH_TOKEN = '__Secure-refresh_token';

/**
 * Reads and decrypts the refresh token cookie.
 *
 * @returns The payload, or null when the cookie is missing, cannot be decrypted,
 * has the wrong shape, or is past the absolute or idle limit.
 */
export async function readRefreshToken(request: Request): Promise<SessionPayload | null> {
  const cookies = parseCookie(request.headers.get('cookie') ?? '');
  if (!cookies[REFRESH_TOKEN]) {
    return null;
  }
  const decrypted = await decrypt(cookies[REFRESH_TOKEN]);
  if (!decrypted) {
    return null;
  }
  const payload = parsePayload(decrypted);
  const now = Date.now();
  if (
    !payload ||
    payload.issuedAt + SESSION_ABSOLUTE_TIMEOUT_MS < now ||
    payload.lastActivity + SESSION_IDLE_TIMEOUT_MS < now
  ) {
    return null;
  }
  return payload;
}

/**
 * Appends the encrypted refresh token cookie with `lastActivity` set to now.
 * `issuedAt` is kept as given, so rewriting never extends the absolute limit.
 * Max-Age is the idle limit or the time left until the absolute limit, whichever is shorter.
 */
export async function appendRefreshTokenCookie(headers: Headers, refreshToken: RefreshTokenData) {
  const now = Date.now();
  const data: SessionPayload = {
    token: refreshToken.token,
    issuedAt: refreshToken.issuedAt,
    lastActivity: now,
  };
  const encryptedToken = await encrypt(JSON.stringify(data));
  const remainingMs = refreshToken.issuedAt + SESSION_ABSOLUTE_TIMEOUT_MS - now;
  const maxAge = Math.max(0, Math.floor(Math.min(SESSION_IDLE_TIMEOUT_MS, remainingMs) / 1000));
  headers.append('Set-Cookie', serializeCookie(REFRESH_TOKEN, encryptedToken, maxAge));
}

export function clearSessionCookies(headers: Headers) {
  headers.append('Set-Cookie', serializeCookie(REFRESH_TOKEN, '', 0));
}

function parsePayload(value: string): SessionPayload | null {
  let data: unknown;
  try {
    data = JSON.parse(value);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) {
    return null;
  }
  const { token, issuedAt, lastActivity } = data as Record<string, unknown>;
  if (
    typeof token !== 'string' ||
    typeof issuedAt !== 'number' ||
    typeof lastActivity !== 'number'
  ) {
    return null;
  }
  return { token, issuedAt, lastActivity };
}
