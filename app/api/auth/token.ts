import { appUrlOrigin } from '../_lib/config.js';
import { SESSION_ABSOLUTE_TIMEOUT_MS } from '../_lib/cookies.js';
import {
  readRefreshToken,
  appendRefreshTokenCookie,
  clearSessionCookies,
} from '../_lib/session.js';
import { fetchUserProfile, requestGoogleToken, toUserProfile } from '../_lib/google.js';
import { fromBase64Url } from '../_lib/base64.js';
import type { Session, UserProfile } from '../../src/shared/types/auth.js';

interface RefreshedTokens {
  accessToken: string;
  expiresIn: number;
  idToken?: string;
}

type AccessTokenResponse =
  { success: true; tokens: RefreshedTokens } | { success: false; status: number };

/**
 * Returns a fresh access token and rewrites the cookie with a new `lastActivity`.
 *
 * @returns 403 for other origins, 401 (cookie cleared) when the session is invalid,
 * 503 when Google fails temporarily, otherwise the `Session`.
 */
export async function POST(request: Request): Promise<Response> {
  if (request.headers.get('origin') !== appUrlOrigin) {
    return new Response(null, { status: 403 });
  }

  const headers = new Headers({ 'Cache-Control': 'no-store' });
  const refreshToken = await readRefreshToken(request);
  if (!refreshToken) {
    clearSessionCookies(headers);
    return new Response(null, { status: 401, headers });
  }

  const response = await getAccessToken(refreshToken.token);
  if (!response.success) {
    if (response.status === 401) {
      clearSessionCookies(headers);
    }
    if (response.status === 503) {
      await appendRefreshTokenCookie(headers, refreshToken);
    }
    return new Response(null, { status: response.status, headers });
  }
  let profile = null;
  if (response.tokens.idToken) {
    profile = readUserProfile(response.tokens.idToken);
  }
  if (!profile) {
    profile = await fetchUserProfile(response.tokens.accessToken);
  }
  const session: Session = {
    token: response.tokens.accessToken,
    expiresIn: response.tokens.expiresIn,
    profile: profile,
    sessionExpiresIn: (refreshToken.issuedAt + SESSION_ABSOLUTE_TIMEOUT_MS - Date.now()) / 1000,
  };
  await appendRefreshTokenCookie(headers, refreshToken);
  return Response.json(session, { headers });
}

/**
 * Exchanges a refresh token for a new access token and a fresh id_token when Google sends one.
 *
 * @returns The tokens on success. On failure, the status to send: 401 when Google
 * rejects the refresh token (`invalid_grant`), 503 when Google fails temporarily
 * or cannot be reached.
 */
async function getAccessToken(refreshToken: string): Promise<AccessTokenResponse> {
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
    return toUserProfile(payload);
  } catch {
    return null;
  }
}
