import { beforeEach, describe, expect, it } from 'vitest';
import { EventRepository } from '@/repositories/events';
import { TripRepository } from '@/repositories/trips';
import { createMemoryDb } from '../helpers/memoryDb';
import type { Db } from '@/db/types';
import type {
  ActivityEventInput,
  EventInput,
  FlightEventInput,
  HotelEventInput,
  LinkEventInput,
  RestaurantEventInput,
  TransportEventInput,
} from '@/shared/types/event';

const commonFields = {
  start_date: '2026-11-02',
  start_time: '10:00',
  end_date: '2026-11-02',
  note: 'Note',
};

const flight: FlightEventInput = {
  ...commonFields,
  type: 'flight',
  mode: 'flight',
  service_number: 'JL045',
  booking_ref: 'ABC123',
  dep_place: 'Tokyo (HND)',
  dep_tz_id: 'Asia/Tokyo',
  arr_date: '2026-11-03',
  arr_time: '08:00',
  arr_place: 'Paris (CDG)',
  arr_tz_id: 'Europe/Paris',
};

const transport: TransportEventInput = {
  ...commonFields,
  type: 'transport',
  mode: 'train',
  service_number: null,
  booking_ref: null,
  dep_place: 'Kyoto',
  dep_tz_id: 'Asia/Tokyo',
  arr_date: '2026-11-02',
  arr_time: '11:00',
  arr_place: 'Osaka',
  arr_tz_id: 'Asia/Tokyo',
};

const hotel: HotelEventInput = {
  ...commonFields,
  type: 'hotel',
  end_date: '2026-11-04',
  name: 'Ryokan',
  booking_ref: 'RES-1',
  address: 'Kyoto',
  check_out_time: '11:00',
  url: 'https://example.com/ryokan',
};

const restaurant: RestaurantEventInput = {
  ...commonFields,
  type: 'restaurant',
  start_time: '19:30',
  name: 'Sushi',
  address: null,
  url: null,
};

const activity: ActivityEventInput = {
  ...commonFields,
  type: 'activity',
  start_time: null,
  name: 'Temple',
  address: 'Kyoto',
  url: 'https://example.com/temple',
};

const link: LinkEventInput = {
  ...commonFields,
  type: 'link',
  start_time: null,
  title: 'Bus map',
  url: 'https://example.com/bus',
};

// Deliberately invalid values that the types would reject.
function invalid(input: EventInput, overrides: Record<string, unknown>): EventInput {
  return { ...input, ...overrides } as EventInput;
}

describe('eventRepository (SQLite)', () => {
  let db: Db;
  let eventRepository: EventRepository;
  let tripId: string;

  beforeEach(async () => {
    db = await createMemoryDb();
    eventRepository = new EventRepository(async () => db);
    const trip = await new TripRepository(async () => db).create({
      title: 'Kyoto',
      start_date: '2026-11-01',
      end_date: '2026-11-09',
    });
    tripId = trip.id;
  });

  describe('create', () => {
    it.each<[string, EventInput]>([
      ['flight', flight],
      ['transport', transport],
      ['hotel', hotel],
      ['restaurant', restaurant],
      ['activity', activity],
      ['link', link],
    ])('saves a %s event and returns it with its details', async (_type, input) => {
      const event = await eventRepository.create(tripId, input);

      expect(event).toMatchObject(input);
      expect(event.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(event.trip_id).toBe(tripId);
      expect(event.created_at).toBe(event.updated_at);
    });

    it('accepts a flight that lands on an earlier local date across the date line', async () => {
      const event = await eventRepository.create(tripId, {
        ...flight,
        start_time: '01:00',
        dep_tz_id: 'Asia/Tokyo',
        arr_date: '2026-11-01',
        arr_time: '13:00',
        arr_tz_id: 'Pacific/Honolulu',
      });

      expect(event).toMatchObject({ arr_date: '2026-11-01' });
    });

    it('rejects an empty trip id', async () => {
      await expect(eventRepository.create('', link)).rejects.toMatchObject({ status: 400 });
    });

    it('rejects a trip that does not exist', async () => {
      await expect(eventRepository.create('missing', link)).rejects.toThrow(/FOREIGN KEY/);
    });

    it.each<[string, EventInput]>([
      ['an invalid start date', { ...link, start_date: '2026-02-30', end_date: '2026-03-01' }],
      ['an invalid end date', { ...link, end_date: 'abc' }],
      ['an end date before the start date', { ...link, end_date: '2026-11-01' }],
      ['a flight without a number', invalid(flight, { service_number: '' })],
      ['a transport without a departure place', { ...transport, dep_place: '' }],
      ['a transport without an arrival place', { ...transport, arr_place: '' }],
      ['an invalid arrival date', { ...transport, arr_date: '2026/11/02' }],
      ['an invalid departure time', { ...transport, start_time: '25:00' }],
      ['an invalid arrival time', { ...transport, arr_time: '' }],
      ['an unknown time zone', { ...transport, arr_tz_id: 'Mars/Base' }],
      [
        'an arrival before the departure',
        { ...transport, arr_date: '2026-11-02', arr_time: '09:00' },
      ],
      ['a hotel without a name', { ...hotel, name: '' }],
      ['a hotel with no overnight stay', { ...hotel, end_date: hotel.start_date }],
      ['an invalid check-in time', { ...hotel, start_time: '' }],
      ['an invalid check-out time', { ...hotel, check_out_time: '99:99' }],
      ['a restaurant without a name', { ...restaurant, name: '' }],
      ['a restaurant without a time', invalid(restaurant, { start_time: '' })],
      ['an activity with an empty time', { ...activity, start_time: '' }],
      ['an activity without a name', { ...activity, name: '' }],
      ['a link without a title', { ...link, title: '' }],
      ['a link without a URL', { ...link, url: '' }],
    ])('rejects %s', async (_case, input) => {
      await expect(eventRepository.create(tripId, input)).rejects.toMatchObject({ status: 400 });
      expect(await eventRepository.getByTrip(tripId)).toEqual([]);
    });
  });

  describe('getByTrip', () => {
    it('returns only the events of the given trip', async () => {
      await eventRepository.create(tripId, link);

      expect(await eventRepository.getByTrip(tripId)).toHaveLength(1);
      expect(await eventRepository.getByTrip('other')).toEqual([]);
    });

    it('sorts by date, then by time with untimed events last', async () => {
      await eventRepository.create(tripId, { ...activity, name: 'Untimed' });
      await eventRepository.create(tripId, { ...restaurant, name: 'Evening' });
      await eventRepository.create(tripId, { ...activity, name: 'Morning', start_time: '09:00' });
      await eventRepository.create(tripId, {
        ...activity,
        name: 'Earlier day',
        start_date: '2026-11-01',
        end_date: '2026-11-01',
      });

      const events = await eventRepository.getByTrip(tripId);

      expect(events.map((event) => ('name' in event ? event.name : null))).toEqual([
        'Earlier day',
        'Morning',
        'Evening',
        'Untimed',
      ]);
    });
  });

  describe('getById', () => {
    it('throws 404 for an unknown event', async () => {
      await expect(eventRepository.getById('missing')).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('update', () => {
    it.each<[string, EventInput, EventInput]>([
      [
        'flight',
        flight,
        { ...flight, service_number: 'JL046', arr_place: 'Nice', booking_ref: null, note: null },
      ],
      [
        'transport',
        transport,
        { ...transport, mode: 'bus', service_number: 'B1', dep_place: 'Nara' },
      ],
      [
        'hotel',
        hotel,
        { ...hotel, name: 'Inn', end_date: '2026-11-05', url: null, check_out_time: null },
      ],
      ['restaurant', restaurant, { ...restaurant, name: 'Ramen', start_time: '12:00' }],
      ['activity', activity, { ...activity, name: 'Shrine', start_time: '09:00', address: null }],
      ['link', link, { ...link, title: 'Train map', url: 'https://example.com/train' }],
    ])('replaces the fields of a %s event', async (_type, input, changes) => {
      const event = await eventRepository.create(tripId, input);
      await new Promise((resolve) => setTimeout(resolve, 5));

      const updated = await eventRepository.update(event.id, changes);

      expect(updated).toMatchObject(changes);
      expect(updated.id).toBe(event.id);
      expect(updated.trip_id).toBe(tripId);
      expect(updated.created_at).toBe(event.created_at);
      expect(updated.updated_at > event.updated_at).toBe(true);
    });

    it('throws 404 for an unknown event', async () => {
      await expect(eventRepository.update('missing', link)).rejects.toMatchObject({ status: 404 });
    });

    it('rejects changing the event type and keeps the event', async () => {
      const event = await eventRepository.create(tripId, hotel);

      await expect(eventRepository.update(event.id, restaurant)).rejects.toMatchObject({
        status: 400,
      });
      expect(await eventRepository.getById(event.id)).toEqual(event);
    });

    it('rejects invalid input and keeps the event', async () => {
      const event = await eventRepository.create(tripId, hotel);

      await expect(eventRepository.update(event.id, { ...hotel, name: '' })).rejects.toMatchObject({
        status: 400,
      });
      expect(await eventRepository.getById(event.id)).toEqual(event);
    });
  });

  describe('delete', () => {
    it('deletes the event and its details', async () => {
      const event = await eventRepository.create(tripId, hotel);

      await eventRepository.delete(event.id);

      await expect(eventRepository.getById(event.id)).rejects.toMatchObject({ status: 404 });
      expect(await db.query('SELECT event_id FROM hotel_events')).toEqual([]);
    });

    it('throws 404 for an unknown event', async () => {
      await expect(eventRepository.delete('missing')).rejects.toMatchObject({ status: 404 });
    });
  });
});
