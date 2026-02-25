import type { EventRow } from '@shared/types/event';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error ?? 'Request failed');
  }

  return res.json();
}

export const eventsApi = {
  getAll(): Promise<EventRow[]> {
    return request('/api/events');
  },

  getById(id: string): Promise<EventRow> {
    return request(`/api/events/${id}`);
  },

  create(body: Partial<EventRow>): Promise<EventRow> {
    return request('/api/events', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(id: string, body: Partial<EventRow>): Promise<EventRow> {
    return request(`/api/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(id: string): Promise<{ success: boolean }> {
    return request(`/api/events/${id}`, { method: 'DELETE' });
  },
};
