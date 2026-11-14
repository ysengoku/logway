import { appendRefreshTokenCookie } from '../_lib/session.js';
import { loginUrl, oauthRedirectUrl } from '../_lib/config.js';
import {
  parseCookie,
  serializeCookie,
  OAUTH_STATE_COOKIE,
  OAUTH_CODE_VERIFIER_COOKIE,
} from '../_lib/cookies.js';
import { GOOGLE_DRIVE_SCOPES, requestGoogleToken } from '../_lib/google.js';
import type { AuthError } from '../_lib/authErrors.js';

type CallbackResult =
  { ok: true; code: string; codeVerifier: string } | { ok: false; error: AuthError };

export default {
  async fetch(request: Request) {
    const callback = validateCallback(request);
    if (!callback.ok) {
      return redirectWithError(callback.error);
    }

    const response = await requestGoogleToken({
      code: callback.code,
      code_verifier: callback.codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: oauthRedirectUrl,
    });
    if (!response.success || !response.payload.refresh_token) {
      return redirectWithError('token_exchange_failed');
    }
    if (!ensureScope(response.payload.scope)) {
      return redirectWithError('missing_scope');
    }

    const headers = new Headers();
    headers.set('Location', '/');
    const refreshTokenData = { token: response.payload.refresh_token, issuedAt: Date.now() };
    await appendRefreshTokenCookie(headers, refreshTokenData);
    clearOAuthCookies(headers);
    return new Response(null, { status: 302, headers });
  },
};

/** Checks that Google sent a code and that the state matches the one stored at login. */
function validateCallback(request: Request): CallbackResult {
  const params = new URL(request.url).searchParams;

  // Google's error can be any string (the URL can be edited by hand), so only
  // pass on the one the sign-in page knows how to explain.
  const error = params.get('error');
  if (error) {
    return { ok: false, error: error === 'access_denied' ? 'access_denied' : 'unknown' };
  }

  const state = params.get('state');
  const code = params.get('code');
  const cookies = parseCookie(request.headers.get('cookie') ?? '');
  if (
    !state ||
    !code ||
    cookies[OAUTH_STATE_COOKIE] !== state ||
    !cookies[OAUTH_CODE_VERIFIER_COOKIE]
  ) {
    return { ok: false, error: 'invalid_state' };
  }

  return { ok: true, code, codeVerifier: cookies[OAUTH_CODE_VERIFIER_COOKIE] };
}

function redirectWithError(error: AuthError): Response {
  const headers = new Headers();
  headers.set('Location', `${loginUrl}?error=${encodeURIComponent(error)}`);
  clearOAuthCookies(headers);
  return new Response(null, { status: 302, headers });
}

/** The state and code verifier are only needed for one sign-in attempt. */
function clearOAuthCookies(headers: Headers): void {
  headers.append('Set-Cookie', serializeCookie(OAUTH_STATE_COOKIE, '', 0));
  headers.append('Set-Cookie', serializeCookie(OAUTH_CODE_VERIFIER_COOKIE, '', 0));
}

function ensureScope(scopeResponse: string): boolean {
  const scopeResponses = scopeResponse.split(' ');
  return GOOGLE_DRIVE_SCOPES.every((element) => scopeResponses.includes(element));
}
