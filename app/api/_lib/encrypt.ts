import { toBase64Url, fromBase64Url } from './base64.js';
import { sessionSecret } from './config.js';

const algorithm = 'AES-GCM';
const IV_LENGTH = 12;

const keyBytes = Uint8Array.fromBase64(sessionSecret);
if (keyBytes.length !== 32) {
  throw new Error('SESSION_SECRET must be 32 bytes');
}
const cryptoKey = crypto.subtle.importKey('raw', keyBytes, algorithm, false, [
  'encrypt',
  'decrypt',
]);

/** Encrypts with AES-256-GCM and a random IV.
 * @returns `base64url(iv).base64url(ciphertext)`.
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await cryptoKey;
  const encoded = new TextEncoder().encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext: ArrayBuffer = await crypto.subtle.encrypt(
    { name: algorithm, iv },
    key,
    encoded,
  );
  return `${toBase64Url(iv)}.${toBase64Url(new Uint8Array(ciphertext))}`;
}

/**
 * Decrypts a value made by `encrypt`.
 *
 * @returns The plaintext, or null when the value is malformed, tampered with,
 * or was encrypted with another key.
 */
export async function decrypt(value: string): Promise<string | null> {
  const key = await cryptoKey;
  try {
    const parts = value.split('.');
    if (parts.length !== 2) {
      return null;
    }
    const iv = fromBase64Url(parts[0]);
    const ciphertext = fromBase64Url(parts[1]);
    const decrypted = await crypto.subtle.decrypt({ name: algorithm, iv }, key, ciphertext);
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}
