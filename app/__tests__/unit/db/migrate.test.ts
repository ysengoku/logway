import { describe, expect, it } from 'vitest';
import { getSchemaVersion, migrate, MIGRATIONS } from '@/db/migrate';
import { createMemoryDb, createMemoryExecutor } from '../helpers/memoryDb';

describe('migrate', () => {
  it('loads migration files in version order', () => {
    expect(MIGRATIONS.length).toBeGreaterThan(0);
    const versions = MIGRATIONS.map((m) => m.version);
    expect(versions).toEqual([...versions].sort((a, b) => a - b));
  });

  it('applies all migrations and records the latest schema version', async () => {
    const executor = await createMemoryExecutor({ migrated: false });
    migrate(executor);

    expect(getSchemaVersion(executor)).toBe(MIGRATIONS.at(-1)!.version);
    const tables = executor.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );
    expect(tables.map((t) => t.name)).toEqual([
      'events',
      'hotel_events',
      'link_events',
      'meta',
      'place_events',
      'transport_events',
      'trips',
    ]);
  });

  it('is safe to run more than once', async () => {
    const executor = await createMemoryExecutor();
    const versionBefore = getSchemaVersion(executor);

    expect(() => migrate(executor)).not.toThrow();
    expect(versionBefore).toBe(MIGRATIONS.at(-1)!.version);
    expect(getSchemaVersion(executor)).toBe(versionBefore);
  });

  it('only applies migrations newer than the current version', async () => {
    const executor = await createMemoryExecutor({ migrated: false });
    migrate(executor, [{ version: 1, sql: 'CREATE TABLE a (id TEXT)' }]);
    migrate(executor, [
      { version: 1, sql: 'CREATE TABLE a (id TEXT)' },
      { version: 2, sql: 'CREATE TABLE b (id TEXT)' },
    ]);

    expect(getSchemaVersion(executor)).toBe(2);
  });

  it('rolls back a failing migration without bumping the version', async () => {
    const executor = await createMemoryExecutor({ migrated: false });
    expect(() =>
      migrate(executor, [{ version: 1, sql: 'CREATE TABLE a (id TEXT); NOT VALID SQL' }]),
    ).toThrow();

    expect(getSchemaVersion(executor)).toBe(0);
    const tables = executor.query("SELECT name FROM sqlite_master WHERE name = 'a'");
    expect(tables).toEqual([]);
  });
});
