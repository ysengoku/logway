import type { EventRow } from '@shared/types/event';
import type { Trip, TripInput } from '@shared/types/trip';

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
  getByTrip(tripId: string): Promise<EventRow[]> {
    return request(`/api/events?trip_id=${tripId}`);
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

export const tripsApi = {
  getAll(): Promise<Trip[]> {
    return request('/api/trips');
  },
  getById(id: string): Promise<Trip> {
    return request(`/api/trips/${id}`);
  },
  create(body: TripInput): Promise<Trip> {
    return request('/api/trips', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  update(id: string, body: Partial<TripInput>): Promise<Trip> {
    return request(`/api/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  delete(id: string): Promise<{ success: boolean }> {
    return request(`/api/trips/${id}`, { method: 'DELETE' });
  },
};
