import { describe, expect, it } from 'vitest';
import { getSchemaVersion, migrate, MIGRATIONS } from '@/db/migrate';
import { createMemoryDb } from '../helpers/memoryDb';

describe('migrate', () => {
  it('loads migration files in version order', () => {
    expect(MIGRATIONS.length).toBeGreaterThan(0);
    const versions = MIGRATIONS.map((m) => m.version);
    expect(versions).toEqual([...versions].sort((a, b) => a - b));
  });

  it('applies all migrations and records the latest schema version', async () => {
    const db = await createMemoryDb({ migrated: false });
    await migrate(db);

    expect(await getSchemaVersion(db)).toBe(MIGRATIONS.at(-1)!.version);
    const tables = await db.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );
    expect(tables.map((t) => t.name)).toEqual([
      'events',
      'hotel_events',
      'link_events',
      'meta',
      'place_events',
      'profile',
      'transport_events',
      'trips',
    ]);
  });

  it('is safe to run more than once', async () => {
    const db = await createMemoryDb();
    await expect(migrate(db)).resolves.toBeUndefined();
  });

  it('only applies migrations newer than the current version', async () => {
    const db = await createMemoryDb({ migrated: false });
    await migrate(db, [{ version: 1, sql: 'CREATE TABLE a (id TEXT)' }]);
    await migrate(db, [
      { version: 1, sql: 'CREATE TABLE a (id TEXT)' },
      { version: 2, sql: 'CREATE TABLE b (id TEXT)' },
    ]);

    expect(await getSchemaVersion(db)).toBe(2);
  });

  it('rolls back a failing migration without bumping the version', async () => {
    const db = await createMemoryDb({ migrated: false });
    await expect(
      migrate(db, [{ version: 1, sql: 'CREATE TABLE a (id TEXT); NOT VALID SQL' }]),
    ).rejects.toThrow();

    expect(await getSchemaVersion(db)).toBe(0);
    const tables = await db.query("SELECT name FROM sqlite_master WHERE name = 'a'");
    expect(tables).toEqual([]);
  });
});
