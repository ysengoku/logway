import { request } from './http';
import type { Trip, TripInput } from '@shared/types/trip';

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
  getByInviteCode(inviteCode: string): Promise<Trip> {
    return request(`/api/trips/by-invite?code=${encodeURIComponent(inviteCode)}`);
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
