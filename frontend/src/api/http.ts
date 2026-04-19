import { supabase } from '@/lib/supabase';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const traceId = `http-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  console.log('[http] request:start', { traceId, path, method: options?.method ?? 'GET' });

  console.log('[http] getSession:start', { traceId, path });
  const { data } = await supabase.auth.getSession();
  console.log('[http] getSession:end', {
    traceId,
    path,
    hasSession: Boolean(data.session),
    userId: data.session?.user?.id ?? null,
  });

  const token = data.session?.access_token;

  console.log('[http] fetch:start', { traceId, url: `${BASE_URL}${path}` });
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  console.log('[http] fetch:end', { traceId, path, status: res.status, ok: res.ok });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: res.statusText, code: undefined as string | undefined }));
    console.log('[http] request:error', { traceId, path, status: res.status, error });
    throw new ApiError(error.error ?? 'Request failed', res.status, error.code);
  }

  console.log('[http] request:success', { traceId, path });
  return res.json();
}
