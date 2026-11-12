import { googleClientId, googleClientSecret } from './config.js';
import type { UserProfile } from '../../src/shared/types/auth.js';

export const GOOGLE_OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const GOOGLE_USER_INFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
];

export const GOOGLE_SCOPES = [
  ...GOOGLE_DRIVE_SCOPES,
  'openid',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const GOOGLE_REQUEST_TIMEOUT_MS = 20_000;

export interface GoogleTokenPayload {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
  refresh_token_expires_in?: number;
}

type GoogleTokenResponse =
  { success: true; payload: GoogleTokenPayload } | { success: false; error: string };

export async function requestGoogleToken(
  params: Record<string, string>,
): Promise<GoogleTokenResponse> {
  let response: Response;
  try {
    response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      body: new URLSearchParams({
        ...params,
        client_id: googleClientId,
        client_secret: googleClientSecret,
      }),
      signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
    });
  } catch {
    return { success: false, error: 'network_error' };
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
    return { success: false, error: typeof body?.error === 'string' ? body.error : 'unknown' };
  }
  const payload = (await response.json().catch(() => null)) as GoogleTokenPayload | null;
  if (!payload) {
    return { success: false, error: 'invalid_response' };
  }
  return { success: true, payload };
}

export async function fetchUserProfile(accessToken: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(GOOGLE_USER_INFO_URL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      return null;
    }
    const data: unknown = await response.json();
    return toUserProfile(data);
  } catch {
    return null;
  }
}

export function toUserProfile(data: unknown): UserProfile | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }
  const { name, picture } = data as Record<string, unknown>;
  if (typeof name !== 'string' || typeof picture !== 'string') {
    return null;
  }
  return { username: name, picture };
}

export async function revokeGoogleToken(refreshToken: string): Promise<boolean> {
  try {
    const response = await fetch(GOOGLE_REVOKE_URL, {
      method: 'POST',
      body: new URLSearchParams({
        token: refreshToken,
      }),
      signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}
