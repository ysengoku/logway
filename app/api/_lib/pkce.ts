import { toBase64Url } from './base64.js';

/** Returns `byteLength` random bytes as base64url, for the OAuth state and the PKCE code verifier. */
export function randomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

/** Returns the PKCE code challenge for `codeVerifier`: base64url(SHA-256), the S256 method. */
export async function createCodeChallenge(codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  return toBase64Url(bytes);
}
