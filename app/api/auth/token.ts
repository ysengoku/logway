import { appUrlOrigin } from '../_lib/config.js';
import { readRefreshToken, clearSessionCookies } from '../_lib/session.js';
import { requestGoogleToken } from '../_lib/google.js';
import { fromBase64Url } from '../_lib/base64.js';
import type { Session, UserProfile } from '../../src/shared/types/auth.js';

interface RefreshedTokens {
  accessToken: string;
  expiresIn: number;
  idToken?: string;
}

type AccessTokenResponse =
  { success: true; tokens: RefreshedTokens } | { success: false; status: number };

export async function POST(request: Request): Promise<Response> {
  if (request.headers.get('origin') !== appUrlOrigin) {
    return new Response(null, { status: 403 });
  }
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  const response = await getAccessToken(request);
  if (!response.success) {
    if (response.status === 401) {
      clearSessionCookies(headers);
    }
    return new Response(null, { status: response.status, headers });
  }
  let profile = null;
  if (response.tokens.idToken) {
    profile = readUserProfile(response.tokens.idToken);
  }
  const session: Session = {
    token: response.tokens.accessToken,
    expiresIn: response.tokens.expiresIn,
    profile: profile,
  };
  return Response.json(session, { headers });
}

/**
 * Exchanges the encrypted refresh token cookie for a new access token
 * (and a fresh id_token when Google sends one).
 *
 * @returns The tokens on success. On failure, the status to send: 401 when the user
 * is not signed in or Google rejects the refresh token (`invalid_grant`), 503 when
 * Google fails temporarily or cannot be reached.
 */
async function getAccessToken(request: Request): Promise<AccessTokenResponse> {
  const refreshToken = await readRefreshToken(request);
  if (!refreshToken) {
    return { success: false, status: 401 };
  }

  const response = await requestGoogleToken({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  if (!response.success) {
    if (response.error === 'invalid_grant') {
      return { success: false, status: 401 };
    }
    return { success: false, status: 503 };
  }
  return {
    success: true,
    tokens: {
      accessToken: response.payload.access_token,
      expiresIn: response.payload.expires_in,
      idToken: response.payload.id_token,
    },
  };
}

/**
 * Reads the name and picture from an id_token's payload for display only.
 * The signature is not verified, so the result must not be used for authorization.
 *
 * @returns The profile, or null when the token is malformed or lacks either claim.
 */
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
