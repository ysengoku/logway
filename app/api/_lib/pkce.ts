export function randomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function createCodeChallenge(codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  return toBase64Url(bytes);
}

function toBase64Url(bytes: Uint8Array<ArrayBuffer>) {
  return bytes.toBase64({ alphabet: 'base64url', omitPadding: true });
}
