import { getDb } from '@/db/client';
import { ApiError } from './errors';
import { insertStatement, pickColumns, updateStatement } from './sql';
import type { Db } from '@/db/types';
import type { EventRow } from '@shared/types/event';

const EDITABLE_COLUMNS = [
  'type',
  'trip_id',
  'note',
  'flight_number',
  'service_number',
  'transport_mode',
  'booking_ref',
  'dep_place',
  'dep_tz_id',
  'dep_local_date',
  'dep_local_time',
  'dep_utc',
  'arr_place',
  'arr_tz_id',
  'arr_local_date',
  'arr_local_time',
  'arr_utc',
  'name',
  'address',
  'url',
  'check_in_date',
  'check_in_time',
  'check_out_date',
  'check_out_time',
  'reservation_date',
  'reservation_time',
  'schedule_date',
  'schedule_time',
  'link_title',
  'link_url',
  'related_date',
] as const;

export function createEventsApi(db: () => Promise<Db>) {
  async function getById(id: string): Promise<EventRow> {
    const [event] = await (await db()).query<EventRow>('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) throw new ApiError('Event not found.', 404);
    return event;
  }

  return {
    async getAll(): Promise<EventRow[]> {
      return (await db()).query<EventRow>('SELECT * FROM events ORDER BY created_at');
    },
    async getByTrip(tripId: string): Promise<EventRow[]> {
      return (await db()).query<EventRow>(
        'SELECT * FROM events WHERE trip_id = ? ORDER BY created_at',
        [tripId],
      );
    },
    getById,
    async create(body: Partial<EventRow>): Promise<EventRow> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await (await db()).exec([
        insertStatement('events', [
          ['id', id],
          ...pickColumns(body, EDITABLE_COLUMNS),
          ['created_at', now],
          ['updated_at', now],
        ]),
      ]);
      return getById(id);
    },
    async update(id: string, body: Partial<EventRow>): Promise<EventRow> {
      await getById(id);
      const values = pickColumns(body, EDITABLE_COLUMNS);
      if (values.length > 0) {
        await (await db()).exec([
          updateStatement('events', id, [...values, ['updated_at', new Date().toISOString()]]),
        ]);
      }
      return getById(id);
    },
    async delete(id: string): Promise<{ success: boolean }> {
      await (await db()).exec([{ sql: 'DELETE FROM events WHERE id = ?', bind: [id] }]);
      return { success: true };
    },
  };
}

export const eventsApi = createEventsApi(getDb);
