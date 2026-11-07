import { oauthRedirectUrl, googleClientId } from '../_lib/config.js';
import { serializeCookie } from '../_lib/cookies.js';
import { GOOGLE_OAUTH_BASE_URL, GOOGLE_SCOPES } from '../_lib/google.js';
import { randomBase64Url, createCodeChallenge } from '../_lib/pkce.js';

export default {
  async fetch() {
    const state = randomBase64Url(32);
    const codeVerifier = randomBase64Url(32);
    const codeChallenge = await createCodeChallenge(codeVerifier);

    const authUrl = buildAuthUrl(state, codeChallenge);
    const headers = new Headers();
    headers.set('Location', authUrl);
    headers.append('Set-Cookie', serializeCookie('oauth_state', state, 600));
    headers.append('Set-Cookie', serializeCookie('oauth_code_verifier', codeVerifier, 600));

    return new Response(null, { status: 302, headers });
  },
};

function buildAuthUrl(state: string, codeChallenge: string): string {
  const params = {
    client_id: googleClientId,
    redirect_uri: oauthRedirectUrl,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent',
  };
  const queryParams = new URLSearchParams(params);
  const url = `${GOOGLE_OAUTH_BASE_URL}?${queryParams.toString()}`;
  return url;
}
