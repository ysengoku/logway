import { beforeEach, describe, expect, it } from 'vitest';
import { createEventsApi } from '@/api/events';
import { ApiError } from '@/api/errors';
import { createTripsApi } from '@/api/trips';
import { createMemoryDb } from '../helpers/memoryDb';
import type { Db } from '@/db/types';

describe('tripsApi (SQLite)', () => {
  let db: Db;
  let tripsApi: ReturnType<typeof createTripsApi>;

  beforeEach(async () => {
    db = await createMemoryDb();
    tripsApi = createTripsApi(async () => db);
  });

  it('creates a trip with generated id and timestamps', async () => {
    const trip = await tripsApi.create({ title: 'Kyoto', start_date: '2026-11-01' });

    expect(trip.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(trip.title).toBe('Kyoto');
    expect(trip.start_date).toBe('2026-11-01');
    expect(trip.end_date).toBeNull();
    expect(trip.share_file_id).toBeNull();
    expect(trip.created_at).toBe(trip.updated_at);
  });

  it('rejects a trip without a title', async () => {
    await expect(tripsApi.create({ title: '' })).rejects.toBeInstanceOf(ApiError);
  });

  it('lists trips by start date with undated trips last', async () => {
    await tripsApi.create({ title: 'Undated' });
    await tripsApi.create({ title: 'Later', start_date: '2026-12-01' });
    await tripsApi.create({ title: 'Sooner', start_date: '2026-11-01' });

    const trips = await tripsApi.getAll();
    expect(trips.map((t) => t.title)).toEqual(['Sooner', 'Later', 'Undated']);
  });

  it('updates only editable fields and bumps updated_at', async () => {
    const trip = await tripsApi.create({ title: 'Kyoto' });
    await new Promise((resolve) => setTimeout(resolve, 5));

    const updated = await tripsApi.update(trip.id, {
      title: 'Osaka',
      id: 'hijacked',
    } as unknown as { title: string });

    expect(updated.id).toBe(trip.id);
    expect(updated.title).toBe('Osaka');
    expect(updated.updated_at > trip.updated_at).toBe(true);
  });

  it('throws 404 for an unknown trip', async () => {
    await expect(tripsApi.getById('missing')).rejects.toMatchObject({ status: 404 });
    await expect(tripsApi.update('missing', { title: 'x' })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('deletes the trip together with its events', async () => {
    const eventsApi = createEventsApi(async () => db);
    const trip = await tripsApi.create({ title: 'Kyoto' });
    await eventsApi.create({ trip_id: trip.id, type: 'link', link_title: 'a', link_url: 'b' });

    await tripsApi.delete(trip.id);

    expect(await tripsApi.getAll()).toEqual([]);
    expect(await eventsApi.getAll()).toEqual([]);
  });
});
