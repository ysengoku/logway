import { encrypt, decrypt } from './encrypt.js';
import { SESSION_MAX_AGE, parseCookie, serializeCookie } from './cookies.js';
import { revokeGoogleToken } from './google.js';

interface SessionPayload {
  token: string;
  expiresAt: number;
}

const REFRESH_TOKEN = '__Secure-refresh_token';

export async function readRefreshToken(request: Request): Promise<string | null> {
  const cookies = parseCookie(request.headers.get('cookie') ?? '');
  if (!cookies[REFRESH_TOKEN]) {
    return null;
  }
  const decrypted = await decrypt(cookies[REFRESH_TOKEN]);
  if (!decrypted) {
    return null;
  }
  const payload = parsePayload(decrypted);
  if (!payload) {
    return null;
  }
  if (payload.expiresAt < Date.now()) {
    await revokeGoogleToken(payload.token);
    return null;
  }
  return payload.token;
}

export async function appendRefreshTokenCookie(headers: Headers, refreshToken: string) {
  const data: SessionPayload = {
    token: refreshToken,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const encryptedToken = await encrypt(JSON.stringify(data));
  headers.append('Set-Cookie', serializeCookie(REFRESH_TOKEN, encryptedToken));
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
  const { token, expiresAt } = data as Record<string, unknown>;
  if (typeof token !== 'string' || typeof expiresAt !== 'number') {
    return null;
  }
  return { token, expiresAt };
}
