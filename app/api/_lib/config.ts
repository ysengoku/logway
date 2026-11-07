function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is missing.`);
  }
  return value;
}

export const loginUrl = `${requireEnv('APP_URL')}/auth`;
export const oauthRedirectUrl = `${requireEnv('APP_URL')}/api/auth/callback`;

export const googleClientId = requireEnv('GOOGLE_CLIENT_ID');
export const googleClientSecret = requireEnv('GOOGLE_CLIENT_SECRET');

export const sessionSecret = requireEnv('SESSION_SECRET');
