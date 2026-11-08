import { readRefreshToken, clearSessionCookies } from '../_lib/session.js';
import { revokeGoogleToken } from '../_lib/google.js';

// Always clears the session cookies and reports success. Revoking the token at
// Google is best effort: a missing cookie or a failed revoke must not block
// sign-out, otherwise the client would keep showing a signed-in state.
export async function POST(request: Request): Promise<Response> {
  const headers = new Headers();
  clearSessionCookies(headers);
  const refreshToken = await readRefreshToken(request);
  if (refreshToken) {
    await revokeGoogleToken(refreshToken);
  }
  return new Response(null, { status: 200, headers });
}
