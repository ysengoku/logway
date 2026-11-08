import { googleClientId, googleClientSecret } from './config.js';

export const GOOGLE_OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
];

export const GOOGLE_SCOPES = [
  ...GOOGLE_DRIVE_SCOPES,
  'openid',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
  refresh_token_expires_in?: number;
}

export async function requestGoogleToken(
  params: Record<string, string>,
): Promise<GoogleTokenResponse | null> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    body: new URLSearchParams({
      ...params,
      client_id: googleClientId,
      client_secret: googleClientSecret,
    }),
  });
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as GoogleTokenResponse;
}

export async function revokeGoogleToken(refreshToken: string): Promise<boolean> {
  try {
    const response = await fetch(GOOGLE_REVOKE_URL, {
      method: 'POST',
      body: new URLSearchParams({
        token: refreshToken,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
