export const SESSION_ABSOLUTE_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SESSION_IDLE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const OAUTH_STATE_COOKIE = '__Secure-oauth_state';
export const OAUTH_CODE_VERIFIER_COOKIE = '__Secure-oauth_code_verifier';

/** @param maxAge Seconds until the browser drops the cookie; 0 deletes it. */
export function serializeCookie(key: string, value: string, maxAge: number): string {
  return `${key}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=${maxAge}`;
}

export function parseCookie(cookies: string): Record<string, string> {
  if (!cookies) {
    return {};
  }
  const elements = cookies.split(';').map((el) => el.trim());
  const parsed: Record<string, string> = {};
  for (const el of elements) {
    const index = el.indexOf('=');
    if (index < 0) continue;
    try {
      parsed[el.slice(0, index)] = decodeURIComponent(el.slice(index + 1));
    } catch {
      continue;
    }
  }
  return parsed;
}
