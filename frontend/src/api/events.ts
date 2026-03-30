import { request } from './http';
import type { EventRow } from '@shared/types/event';

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
