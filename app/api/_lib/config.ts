function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is missing.`);
  }
  return value;
}

const appUrl = requireEnv('APP_URL').replace(/\/+$/, '');

export const appUrlOrigin = new URL(appUrl).origin;
export const loginUrl = `${appUrl}/auth`;
export const oauthRedirectUrl = `${appUrl}/api/auth/callback`;

export const googleClientId = requireEnv('GOOGLE_CLIENT_ID');
export const googleClientSecret = requireEnv('GOOGLE_CLIENT_SECRET');

export const sessionSecret = requireEnv('SESSION_SECRET');
