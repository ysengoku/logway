import { beforeEach, describe, expect, it } from 'vitest';
import { createEventsApi } from '@/repositories/events';
import { createTripsApi } from '@/repositories/trips';
import { createMemoryDb } from '../helpers/memoryDb';
import type { EventRow } from '@/shared/types/event';

describe('eventsApi (SQLite)', () => {
  let eventsApi: ReturnType<typeof createEventsApi>;
  let tripId: string;

  beforeEach(async () => {
    const db = await createMemoryDb();
    eventsApi = createEventsApi(async () => db);
    tripId = (await createTripsApi(async () => db).create({ title: 'Kyoto' })).id;
  });

  it('creates an event and ignores columns that are not editable', async () => {
    const event = await eventsApi.create({
      trip_id: tripId,
      type: 'restaurant',
      name: 'Sushi',
      reservation_date: '2026-11-02',
      reservation_time: '19:30',
      created_at: '1999-01-01',
      unknown_column: 'x',
    } as Partial<EventRow>);

    expect(event.name).toBe('Sushi');
    expect(event.reservation_time).toBe('19:30');
    expect(event.created_at).not.toBe('1999-01-01');
    expect(event).not.toHaveProperty('unknown_column');
  });

  it('lists events of a single trip', async () => {
    await eventsApi.create({ trip_id: tripId, type: 'link', link_title: 'a', link_url: 'b' });

    expect(await eventsApi.getByTrip(tripId)).toHaveLength(1);
    expect(await eventsApi.getByTrip('other')).toEqual([]);
  });

  it('leaves omitted fields unchanged and clears fields set to null', async () => {
    const event = await eventsApi.create({
      trip_id: tripId,
      type: 'activity',
      name: 'Temple',
      schedule_date: '2026-11-03',
      schedule_time: '10:00',
      note: 'bring cash',
    });

    const updated = await eventsApi.update(event.id, {
      name: 'Shrine',
      schedule_time: undefined,
      note: null,
    } as unknown as Partial<EventRow>);

    expect(updated.name).toBe('Shrine');
    expect(updated.schedule_time).toBe('10:00');
    expect(updated.note).toBeNull();
  });

  it('rejects an event for a trip that does not exist', async () => {
    await expect(
      eventsApi.create({ trip_id: 'missing', type: 'link', link_title: 'a', link_url: 'b' }),
    ).rejects.toThrow(/FOREIGN KEY/);
  });

  it('rejects an unknown event type', async () => {
    await expect(
      eventsApi.create({ trip_id: tripId, type: 'party' } as unknown as Partial<EventRow>),
    ).rejects.toThrow(/CHECK/);
  });

  it('deletes an event', async () => {
    const event = await eventsApi.create({
      trip_id: tripId,
      type: 'link',
      link_title: 'a',
      link_url: 'b',
    });

    await eventsApi.delete(event.id);

    await expect(eventsApi.getById(event.id)).rejects.toMatchObject({ status: 404 });
  });
});
