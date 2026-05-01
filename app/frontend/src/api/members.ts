import { request } from './http';
import type { TripMember } from '@shared/types/trip';

export const membersApi = {
  getAll(tripId: string): Promise<TripMember[]> {
    return request(`/api/trips/${tripId}/members`);
  },

  add(tripId: string): Promise<TripMember> {
    return request(`/api/trips/${tripId}/members`, {
      method: 'POST',
    });
  },

  remove(tripId: string, userId: string): Promise<{ success: boolean }> {
    return request(`/api/trips/${tripId}/members/${userId}`, {
      method: 'DELETE',
    });
  },
};
