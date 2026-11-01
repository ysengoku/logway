import { getDb } from '@/db/client';
import type { Db } from '@/db/types';
import type { EventRow } from '@/shared/types/event';

// Spec: tests/unit/api/events.test.ts
export function createEventsApi(db: () => Promise<Db>) {
  void db;
  const notImplemented = (): never => {
    throw new Error('Not implemented');
  };

  return {
    async getAll(): Promise<EventRow[]> {
      return notImplemented();
    },
    async getByTrip(tripId: string): Promise<EventRow[]> {
      void tripId;
      return notImplemented();
    },
    async getById(id: string): Promise<EventRow> {
      void id;
      return notImplemented();
    },
    async create(body: Partial<EventRow>): Promise<EventRow> {
      void body;
      return notImplemented();
    },
    async update(id: string, body: Partial<EventRow>): Promise<EventRow> {
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

export const eventsApi = createEventsApi(getDb);
