const THIRTY_DAYS = 60 * 60 * 24 * 30;

export function serializeCookie(key: string, value: string, maxAge: number = THIRTY_DAYS): string {
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
