import { parseCookie, serializeCookie } from './cookies.js';
import { encrypt, decrypt } from './encrypt.js';

const REFRESH_TOKEN = 'refresh_token';
const ID_TOKEN = 'id_token';

export async function readRefreshToken(request: Request): Promise<string | null> {
  const cookies = parseCookie(request.headers.get('cookie') ?? '');
  if (!cookies[REFRESH_TOKEN]) {
    return null;
  }
  return decrypt(cookies[REFRESH_TOKEN]);
}

export async function appendRefreshTokenCookie(headers: Headers, refreshToken: string) {
  const encryptedToken = await encrypt(refreshToken);
  headers.append('Set-Cookie', serializeCookie(REFRESH_TOKEN, encryptedToken));
}

export function clearSessionCookies(headers: Headers) {
  headers.append('Set-Cookie', serializeCookie(REFRESH_TOKEN, '', 0));
  headers.append('Set-Cookie', serializeCookie(ID_TOKEN, '', 0));
}
