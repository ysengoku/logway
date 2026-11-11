export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export const OAUTH_STATE_COOKIE = '__Secure-oauth_state';
export const OAUTH_CODE_VERIFIER_COOKIE = '__Secure-oauth_code_verifier';

export function serializeCookie(
  key: string,
  value: string,
  maxAge: number = SESSION_MAX_AGE,
): string {
  return `${key}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=${maxAge}`;
}

export function parseCookie(cookie: string): Record<string, string> {
  if (!cookie) {
    return {};
  }
  const elements = cookie.split(';').map((el) => el.trim());
  const parsed: Record<string, string> = {};
  for (const el of elements) {
    const index = el.indexOf('=');
    if (index < 0) continue;
    parsed[el.slice(0, index)] = decodeURIComponent(el.slice(index + 1));
  }
  return parsed;
}
