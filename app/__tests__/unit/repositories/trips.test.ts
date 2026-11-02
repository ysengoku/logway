import { beforeEach, describe, expect, it } from 'vitest';
import { createEventsApi } from '@/repositories/events';
import { ApiError } from '@/repositories/errors';
import { TripRepository } from '@/repositories/trips';
import { createMemoryDb } from '../helpers/memoryDb';
import type { Db } from '@/db/types';
import type { TripInput } from '@/shared/types/trip';

function tripInput(overrides: Partial<TripInput> = {}): TripInput {
  return { title: 'Kyoto', start_date: '2026-11-01', end_date: '2026-11-03', ...overrides };
}

describe('tripRepository (SQLite)', () => {
  let db: Db;
  let tripRepository: TripRepository;

  beforeEach(async () => {
    db = await createMemoryDb();
    tripRepository = new TripRepository(async () => db);
  });

  it('creates a trip with generated id and timestamps', async () => {
    const trip = await tripRepository.create(tripInput());

    expect(trip.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(trip.title).toBe('Kyoto');
    expect(trip.start_date).toBe('2026-11-01');
    expect(trip.end_date).toBe('2026-11-03');
    expect(trip.share_file_id).toBeNull();
    expect(trip.created_at).toBe(trip.updated_at);
  });

  it.each([
    ['title', { title: '' }],
    ['start date', { start_date: '' }],
    ['end date', { end_date: '' }],
  ])('rejects a trip without a %s', async (_field, overrides) => {
    const result = tripRepository.create(tripInput(overrides));

    await expect(result).rejects.toBeInstanceOf(ApiError);
    await expect(result).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a trip that ends before it starts', async () => {
    await expect(
      tripRepository.create(tripInput({ start_date: '2026-11-05', end_date: '2026-11-04' })),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('accepts a same-day trip', async () => {
    const trip = await tripRepository.create(
      tripInput({ start_date: '2026-11-05', end_date: '2026-11-05' }),
    );

    expect(trip.start_date).toBe('2026-11-05');
    expect(trip.end_date).toBe('2026-11-05');
  });

  it('lists trips by start date', async () => {
    await tripRepository.create(
      tripInput({ title: 'Later', start_date: '2026-12-01', end_date: '2026-12-02' }),
    );
    await tripRepository.create(
      tripInput({ title: 'Sooner', start_date: '2026-11-01', end_date: '2026-11-02' }),
    );

    const trips = await tripRepository.getAll();
    expect(trips.map((t) => t.title)).toEqual(['Sooner', 'Later']);
  });

  it('updates only editable fields and bumps updated_at', async () => {
    const trip = await tripRepository.create(tripInput());
    await new Promise((resolve) => setTimeout(resolve, 5));

    const updated = await tripRepository.update(trip.id, {
      title: 'Osaka',
      id: 'hijacked',
    } as unknown as { title: string });

    expect(updated.id).toBe(trip.id);
    expect(updated.title).toBe('Osaka');
    expect(updated.start_date).toBe(trip.start_date);
    expect(updated.end_date).toBe(trip.end_date);
    expect(updated.updated_at > trip.updated_at).toBe(true);
  });

  it.each([
    ['an empty title', { title: '' }],
    ['an empty start date', { start_date: '' }],
    ['a malformed end date', { end_date: '2026/11/10' }],
    ['a date that does not exist', { end_date: '2026-11-31' }],
    ['an end date before the stored start date', { end_date: '2026-10-31' }],
    ['a start date after the stored end date', { start_date: '2026-11-04' }],
  ])('rejects an update with %s', async (_case, changes) => {
    const trip = await tripRepository.create(tripInput());

    await expect(tripRepository.update(trip.id, changes)).rejects.toMatchObject({ status: 400 });
    expect(await tripRepository.getById(trip.id)).toEqual(trip);
  });

  it('accepts an update that moves both dates', async () => {
    const trip = await tripRepository.create(tripInput());

    const updated = await tripRepository.update(trip.id, {
      start_date: '2026-12-10',
      end_date: '2026-12-12',
    });

    expect(updated.start_date).toBe('2026-12-10');
    expect(updated.end_date).toBe('2026-12-12');
    expect(updated.title).toBe(trip.title);
  });

  it('throws 404 for an unknown trip', async () => {
    await expect(tripRepository.getById('missing')).rejects.toMatchObject({ status: 404 });
    await expect(tripRepository.update('missing', { title: 'x' })).rejects.toMatchObject({
      status: 404,
    });
    await expect(tripRepository.delete('missing')).rejects.toMatchObject({ status: 404 });
  });

  it('deletes the trip together with its events', async () => {
    const eventsApi = createEventsApi(async () => db);
    const trip = await tripRepository.create(tripInput());
    await eventsApi.create({ trip_id: trip.id, type: 'link', link_title: 'a', link_url: 'b' });

    await tripRepository.delete(trip.id);

    expect(await tripRepository.getAll()).toEqual([]);
    expect(await eventsApi.getAll()).toEqual([]);
  });
});
