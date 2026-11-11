export function toBase64Url(bytes: Uint8Array<ArrayBuffer>): string {
  return bytes.toBase64({ alphabet: 'base64url', omitPadding: true });
}

export function fromBase64Url(base64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.fromBase64(base64, { alphabet: 'base64url' });
}
