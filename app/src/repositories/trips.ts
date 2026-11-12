import { ApiError } from './errors';
import { getDb } from '@/db/client';
import { isValidDate } from '@/validators';
import type { Db, Statement } from '@/db/types';
import type { Trip, TripInput } from '@/shared/types/trip';

const EDITABLE_COLUMNS = ['title', 'start_date', 'end_date'] as const;

export class TripRepository {
  constructor(private readonly getDb: () => Promise<Db>) {}

  async getAll(): Promise<Trip[]> {
    const db = await this.getDb();
    return db.query<Trip>('SELECT * FROM trips ORDER BY start_date');
  }

  async getById(id: string): Promise<Trip> {
    const db = await this.getDb();
    const [trip] = await db.query<Trip>('SELECT * FROM trips WHERE id = ?', [id]);
    if (!trip) {
      throw new ApiError('errors.notFound', 404);
    }
    return trip;
  }

  async create(body: TripInput): Promise<Trip> {
    this.validateInput(body);

    const db = await this.getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const statement: Statement = {
      sql: 'INSERT INTO trips (id, title, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      bind: [id, body.title, body.start_date, body.end_date, now, now],
    };
    await db.exec([statement]);
    return this.getById(id);
  }

  async update(id: string, body: Partial<TripInput>): Promise<Trip> {
    const currentData = await this.getById(id);
    const newData = {
      title: body.title ?? currentData.title,
      start_date: body.start_date ?? currentData.start_date,
      end_date: body.end_date ?? currentData.end_date,
    };
    this.validateInput(newData);
    const db = await this.getDb();
    await this.assertEventsWithinDates(db, id, newData.start_date, newData.end_date);

    const assignments: string[] = [];
    const values: string[] = [];
    for (const column of EDITABLE_COLUMNS) {
      if (body[column] === undefined) {
        continue;
      }
      assignments.push(`${column} = ?`);
      values.push(body[column]);
    }
    assignments.push('updated_at = ?');

    const statement: Statement = {
      sql: `UPDATE trips SET ${assignments.join(',')} WHERE id = ?`,
      bind: [...values, new Date().toISOString(), id],
    };
    await db.exec([statement]);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    const statement: Statement = {
      sql: 'DELETE FROM trips WHERE id = ?',
      bind: [id],
    };
    const changes = await db.exec([statement]);
    if (!changes) {
      throw new ApiError('errors.notFound', 404);
    }
  }

  private validateInput(body: TripInput): void {
    if (!body.title) {
      throw new ApiError('errors.trip.titleRequired', 400);
    }
    if (!isValidDate(body.start_date) || !isValidDate(body.end_date)) {
      throw new ApiError('errors.trip.invalidDate', 400);
    }
    if (body.start_date > body.end_date) {
      throw new ApiError('errors.trip.dateOrder', 400);
    }
  }

  private async assertEventsWithinDates(
    db: Db,
    id: string,
    start: string,
    end: string,
  ): Promise<void> {
    const [outOfRange] = await db.query<{ count: number }>(
      'SELECT COUNT(*) AS count FROM event_details WHERE trip_id = ? AND (start_date < ? OR end_date > ? OR arr_date > ?)',
      [id, start, end, end],
    );
    if (outOfRange.count > 0) {
      throw new ApiError('errors.trip.eventsOutsideDates', 400, { count: outOfRange.count });
    }
  }
}

export const tripRepository = new TripRepository(getDb);
