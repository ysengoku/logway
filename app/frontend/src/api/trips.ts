import { getDb } from '@/db/client';
import { ApiError } from './errors';
import { insertStatement, pickColumns, updateStatement } from './sql';
import type { Db } from '@/db/types';
import type { Trip, TripInput } from '@shared/types/trip';

const EDITABLE_COLUMNS = ['title', 'start_date', 'end_date'] as const;

export function createTripsApi(db: () => Promise<Db>) {
  async function getById(id: string): Promise<Trip> {
    const [trip] = await (await db()).query<Trip>('SELECT * FROM trips WHERE id = ?', [id]);
    if (!trip) throw new ApiError('Trip not found.', 404);
    return trip;
  }

  return {
    async getAll(): Promise<Trip[]> {
      return (await db()).query<Trip>('SELECT * FROM trips ORDER BY start_date IS NULL, start_date');
    },
    getById,
    async create(body: TripInput): Promise<Trip> {
      if (!body.title) throw new ApiError('Title is required.', 400);
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await (await db()).exec([
        insertStatement('trips', [
          ['id', id],
          ...pickColumns(body, EDITABLE_COLUMNS),
          ['created_at', now],
          ['updated_at', now],
        ]),
      ]);
      return getById(id);
    },
    async update(id: string, body: Partial<TripInput>): Promise<Trip> {
      await getById(id);
      const values = pickColumns(body, EDITABLE_COLUMNS);
      if (values.length > 0) {
        await (await db()).exec([
          updateStatement('trips', id, [...values, ['updated_at', new Date().toISOString()]]),
        ]);
      }
      return getById(id);
    },
    async delete(id: string): Promise<{ success: boolean }> {
      // Events are removed by ON DELETE CASCADE.
      await (await db()).exec([{ sql: 'DELETE FROM trips WHERE id = ?', bind: [id] }]);
      return { success: true };
    },
  };
}

export const tripsApi = createTripsApi(getDb);
