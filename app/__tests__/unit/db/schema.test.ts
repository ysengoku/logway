import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryDb } from '../helpers/memoryDb';
import type { Db } from '@/db/types';

// Constraints enforced by the schema itself, independent of the repositories.
describe('schema: trips', () => {
  let db: Db;

  const insertTrip = (id: string, startDate: string, endDate: string) =>
    db.exec([
      {
        sql: "INSERT INTO trips (id, title, start_date, end_date, created_at, updated_at) VALUES (?, 'Trip', ?, ?, '', '')",
        bind: [id, startDate, endDate],
      },
    ]);

  beforeEach(async () => {
    db = await createMemoryDb();
  });

  it('accepts a trip whose end date is on or after its start date', async () => {
    await insertTrip('same-day', '2026-11-05', '2026-11-05');
    await insertTrip('multi-day', '2026-11-05', '2026-11-07');

    const rows = await db.query('SELECT id FROM trips');
    expect(rows).toHaveLength(2);
  });

  it('rejects inserting a trip that ends before it starts', async () => {
    await expect(insertTrip('bad', '2026-11-05', '2026-11-04')).rejects.toThrow(/CHECK/);
  });

  it('rejects updating a trip so that it ends before it starts', async () => {
    await insertTrip('trip', '2026-11-05', '2026-11-07');

    await expect(
      db.exec([{ sql: "UPDATE trips SET end_date = '2026-11-01' WHERE id = 'trip'" }]),
    ).rejects.toThrow(/CHECK/);

    const [row] = await db.query<{ end_date: string }>(
      "SELECT end_date FROM trips WHERE id = 'trip'",
    );
    expect(row?.end_date).toBe('2026-11-07');
  });
});
