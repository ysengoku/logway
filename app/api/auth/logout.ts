import { appUrlOrigin } from '../_lib/config.js';
import { readRefreshToken, clearSessionCookies } from '../_lib/session.js';
import { revokeGoogleToken } from '../_lib/google.js';

/**
 * Signs the user out of this device, or of all devices when the JSON body has
 * `allDevices: true`. A missing or invalid body signs out this device only.
 *
 * Signing out of all devices revokes the grant at Google, which ends the sessions
 * on the other devices too. The revoke is best effort: a missing cookie or a
 * failed revoke must not block sign-out.
 *
 * @returns 403 for requests from other origins. Otherwise 200, always with the
 * headers that clear the session cookie.
 */
export async function POST(request: Request): Promise<Response> {
  if (request.headers.get('origin') !== appUrlOrigin) {
    return new Response(null, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { allDevices?: unknown } | null;
  const allDevices = body?.allDevices === true;
  const headers = new Headers();
  clearSessionCookies(headers);
  const refreshToken = await readRefreshToken(request);
  if (refreshToken && allDevices) {
    await revokeGoogleToken(refreshToken.token);
  }
  return new Response(null, { status: 200, headers });
}
