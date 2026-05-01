import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '/', `https://${host}`);

  const headers = new Headers();
  Object.entries(req.headers || {}).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(',') : String(value));
    }
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === 'GET' ? undefined : req.body ? JSON.stringify(req.body) : undefined,
  };
  const request = new Request(url.toString(), init);

  const response = await app.fetch(request);

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  res.send(buffer);
}
