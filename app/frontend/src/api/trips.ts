import { getDb } from '@/db/client';
import type { Db } from '@/db/types';
import type { Trip, TripInput } from '@shared/types/trip';

// Spec: tests/unit/api/trips.test.ts
export function createTripsApi(db: () => Promise<Db>) {
  void db;
  const notImplemented = (): never => {
    throw new Error('Not implemented');
  };

  return {
    async getAll(): Promise<Trip[]> {
      return notImplemented();
    },
    async getById(id: string): Promise<Trip> {
      void id;
      return notImplemented();
    },
    async create(body: TripInput): Promise<Trip> {
      void body;
      return notImplemented();
    },
    async update(id: string, body: Partial<TripInput>): Promise<Trip> {
      void id;
      void body;
      return notImplemented();
    },
    async delete(id: string): Promise<{ success: boolean }> {
      void id;
      return notImplemented();
    },
  };
}

export const tripsApi = createTripsApi(getDb);
