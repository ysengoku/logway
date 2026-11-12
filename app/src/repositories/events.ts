import { ApiError } from './errors';
import { getDb } from '@/db/client';
import { isValidDate, isValidTime, isValidTimeZone } from '@/validators';
import { toUTC } from '@/utils/time';
import type { Db, Statement, SqlValue } from '@/db/types';
import type {
  ActivityEventInput,
  EventInput,
  FlightEventInput,
  HotelEventInput,
  RestaurantEventInput,
  TransportEventInput,
  TripEvent,
} from '@/shared/types/event';
import type { Trip } from '@/shared/types/trip';

export class EventRepository {
  constructor(private readonly getDb: () => Promise<Db>) {}

  async getByTrip(tripId: string): Promise<TripEvent[]> {
    const db = await this.getDb();
    return await db.query<TripEvent>(
      'SELECT * FROM event_details WHERE trip_id = ? ORDER BY start_date, start_time IS NULL, start_time',
      [tripId],
    );
  }

  async getById(id: string): Promise<TripEvent> {
    const db = await this.getDb();
    const [event] = await db.query<TripEvent>('SELECT * FROM event_details WHERE id = ?', [id]);
    if (!event) {
      throw new ApiError('errors.notFound', 404);
    }
    return event;
  }

  async create(tripId: string, input: EventInput): Promise<TripEvent> {
    if (!tripId) {
      throw new ApiError('errors.event.tripIdRequired', 400);
    }
    const db = await this.getDb();
    const trip = await this.getTripDates(db, tripId);
    this.validateInput(input, trip);

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const eventStatement = {
      sql: 'INSERT INTO events (id, trip_id, type, start_date, start_time, end_date, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      bind: [
        id,
        tripId,
        input.type,
        input.start_date,
        input.start_time,
        input.end_date,
        input.note,
        now,
        now,
      ],
    };

    await db.exec([eventStatement, this.saveDetail(id, input)]);
    return await this.getById(id);
  }

  async update(id: string, input: EventInput): Promise<TripEvent> {
    const current = await this.getById(id);
    if (current.type !== input.type) {
      throw new ApiError('errors.event.typeChanged', 400);
    }
    const db = await this.getDb();
    const trip = await this.getTripDates(db, current.trip_id);
    this.validateInput(input, trip);

    const now = new Date().toISOString();
    const eventStatement = {
      sql: 'UPDATE events SET start_date = ?, start_time = ?, end_date = ?, note = ?, updated_at = ? WHERE id = ?',
      bind: [input.start_date, input.start_time, input.end_date, input.note, now, id],
    };
    await db.exec([eventStatement, this.saveDetail(id, input)]);
    return await this.getById(id);
  }

  async delete(id: string) {
    const db = await this.getDb();
    const statement: Statement = {
      sql: 'DELETE FROM events WHERE id = ?',
      bind: [id],
    };
    const changes = await db.exec([statement]);
    if (!changes) {
      throw new ApiError('errors.notFound', 404);
    }
  }

  private async getTripDates(db: Db, id: string): Promise<Pick<Trip, 'start_date' | 'end_date'>> {
    const [trip] = await db.query<Pick<Trip, 'start_date' | 'end_date'>>(
      'SELECT start_date, end_date FROM trips WHERE id = ?',
      [id],
    );
    if (!trip) {
      throw new ApiError('errors.event.tripNotFound', 404);
    }
    return trip;
  }

  private validateInput(input: EventInput, trip: Pick<Trip, 'start_date' | 'end_date'>) {
    if (
      !isValidDate(input.start_date) ||
      !isValidDate(input.end_date) ||
      input.start_date > input.end_date
    ) {
      throw new ApiError('errors.event.invalidDates', 400);
    }
    if (input.start_date < trip.start_date || input.end_date > trip.end_date) {
      throw new ApiError('errors.event.outsideTrip', 400);
    }
    switch (input.type) {
      case 'flight':
      case 'transport':
        this.validateTransportInput(input, trip.end_date);
        break;
      case 'hotel':
        this.validateHotelInput(input);
        break;
      case 'restaurant':
      case 'activity':
        this.validatePlaceInput(input);
        break;
      case 'link':
        if (!input.title || !input.url) {
          throw new ApiError('errors.event.titleAndUrlRequired', 400);
        }
    }
  }

  private validateTransportInput(input: FlightEventInput | TransportEventInput, tripEnd: string) {
    if (input.type === 'flight' && !input.service_number) {
      throw new ApiError('errors.event.flightNumberRequired', 400);
    }
    if (!input.dep_place || !input.arr_place) {
      throw new ApiError('errors.event.placesRequired', 400);
    }

    if (
      !isValidDate(input.arr_date) ||
      !isValidTime(input.start_time) ||
      !isValidTime(input.arr_time) ||
      !isValidTimeZone(input.dep_tz_id) ||
      !isValidTimeZone(input.arr_tz_id)
    ) {
      throw new ApiError('errors.event.invalidTransportDateTime', 400);
    }
    if (input.arr_date > tripEnd) {
      throw new ApiError('errors.event.outsideTrip', 400);
    }

    const departure = toUTC(input.start_date, input.start_time, input.dep_tz_id);
    const arrival = toUTC(input.arr_date, input.arr_time, input.arr_tz_id);
    if (!departure || !arrival || arrival < departure) {
      throw new ApiError('errors.event.arrivalBeforeDeparture', 400);
    }
  }

  private validateHotelInput(input: HotelEventInput) {
    if (!input.name) {
      throw new ApiError('errors.event.nameRequired', 400);
    }
    if (input.start_date >= input.end_date) {
      throw new ApiError('errors.event.checkoutAfterCheckin', 400);
    }
    if (
      (input.start_time !== null && !isValidTime(input.start_time)) ||
      (input.check_out_time !== null && !isValidTime(input.check_out_time))
    ) {
      throw new ApiError('errors.event.invalidHotelTime', 400);
    }
  }

  private validatePlaceInput(input: RestaurantEventInput | ActivityEventInput) {
    if (!input.name) {
      throw new ApiError('errors.event.nameRequired', 400);
    }
    if (input.type === 'restaurant' && !isValidTime(input.start_time)) {
      throw new ApiError('errors.event.startTimeRequired', 400);
    }
    if (input.type === 'activity' && input.start_time !== null && !isValidTime(input.start_time)) {
      throw new ApiError('errors.event.invalidStartTime', 400);
    }
  }

  private saveDetail(id: string, input: EventInput): Statement {
    switch (input.type) {
      case 'flight':
      case 'transport':
        return this.saveStatement('transport_events', {
          event_id: id,
          mode: input.mode,
          service_number: input.service_number,
          booking_ref: input.booking_ref,
          dep_place: input.dep_place,
          dep_tz_id: input.dep_tz_id,
          arr_place: input.arr_place,
          arr_date: input.arr_date,
          arr_tz_id: input.arr_tz_id,
          arr_time: input.arr_time,
        });
      case 'hotel':
        return this.saveStatement('hotel_events', {
          event_id: id,
          name: input.name,
          booking_ref: input.booking_ref,
          address: input.address,
          check_out_time: input.check_out_time,
          url: input.url,
        });
      case 'restaurant':
      case 'activity':
        return this.saveStatement('place_events', {
          event_id: id,
          name: input.name,
          address: input.address,
          url: input.url,
        });
      case 'link':
        return this.saveStatement('link_events', {
          event_id: id,
          title: input.title,
          url: input.url,
        });
    }
  }

  private saveStatement(table: string, values: Record<string, SqlValue>): Statement {
    const columns = Object.keys(values);
    const placeholders = columns.map(() => '?').join(', ');
    return {
      sql: `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
      bind: Object.values(values),
    };
  }
}

export const eventRepository = new EventRepository(getDb);
