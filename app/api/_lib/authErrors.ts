// Error codes sent back to the sign-in page as `/auth?error=<code>`.
export const AUTH_ERRORS = [
  'access_denied',
  'invalid_state',
  'missing_scope',
  'token_exchange_failed',
  'unknown',
] as const;

export type AuthError = (typeof AUTH_ERRORS)[number];
