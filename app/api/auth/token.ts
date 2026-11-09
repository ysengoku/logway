import { appUrlOrigin } from '../_lib/config.js';
import { readRefreshToken } from '../_lib/session.js';
import { requestGoogleToken } from '../_lib/google.js';
import { fromBase64Url } from '../_lib/base64.js';
import type { Session, UserProfile } from '../../src/shared/types/auth.js';

interface RefreshedTokens {
  accessToken: string;
  expiresIn: number;
  idToken?: string;
}

export async function POST(request: Request): Promise<Response> {
  if (request.headers.get('origin') !== appUrlOrigin) {
    return new Response(null, { status: 403 });
  }
  const data = await getAccessToken(request);
  if (!data) {
    return new Response(null, { status: 401 });
  }
  let profile = null;
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  if (data.idToken) {
    profile = readUserProfile(data.idToken);
  }

  const session: Session = {
    token: data.accessToken,
    expiresIn: data.expiresIn,
    profile: profile,
  };
  return Response.json(session, { headers });
}

// Exchanges the encrypted refresh token cookie for a new access token (and a fresh
// id_token when Google sends one). Returns null when the user is not signed in or
// Google rejects the refresh token.
async function getAccessToken(request: Request): Promise<RefreshedTokens | null> {
  const refreshToken = await readRefreshToken(request);
  if (!refreshToken) {
    return null;
  }

  const data = await requestGoogleToken({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  if (!data) {
    return null;
  }
  return { accessToken: data.access_token, expiresIn: data.expires_in, idToken: data.id_token };
}

// Reads the name and picture from an id_token's payload for display only.
// The signature is not verified, so the result must not be used for authorization.
// Returns null when the token is malformed or lacks either claim.
function readUserProfile(idToken: string): UserProfile | null {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    return null;
  }
  try {
    const payload: unknown = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[1])));
    if (typeof payload !== 'object' || payload === null) {
      return null;
    }
    const { name, picture } = payload as Record<string, unknown>;
    if (typeof name !== 'string' || typeof picture !== 'string') {
      return null;
    }
    return { username: name, picture };
  } catch {
    return null;
  }
}
