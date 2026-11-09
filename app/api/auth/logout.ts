import { appUrlOrigin } from '../_lib/config.js';
import { readRefreshToken, clearSessionCookies } from '../_lib/session.js';
import { revokeGoogleToken } from '../_lib/google.js';

// Rejects requests from other origins with 403
// For same-origin requests, always clears the session cookies and reports success.
// Revoking the token at Google is best effort: a missing cookie or a failed revoke must not block sign-out.
export async function POST(request: Request): Promise<Response> {
  if (request.headers.get('origin') !== appUrlOrigin) {
    return new Response(null, { status: 403 });
  }
  const headers = new Headers();
  clearSessionCookies(headers);
  const refreshToken = await readRefreshToken(request);
  if (refreshToken) {
    await revokeGoogleToken(refreshToken);
  }
  return new Response(null, { status: 200, headers });
}
