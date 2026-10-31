import type { Db } from './types';

export interface Migration {
  version: number;
  sql: string;
}

const migrationFiles = import.meta.glob<string>('./migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Files are named NNN_description.sql; NNN is the schema version.
export const MIGRATIONS: Migration[] = Object.entries(migrationFiles)
  .map(([path, sql]) => {
    const match = path.match(/\/(\d+)_[^/]+\.sql$/);
    if (!match) throw new Error(`Invalid migration file name: ${path}`);
    return { version: Number(match[1]), sql };
  })
  .sort((a, b) => a.version - b.version);

export async function getSchemaVersion(db: Db): Promise<number> {
  const [row] = await db.query<{ value: string }>(
    "SELECT value FROM meta WHERE key = 'schema_version'",
  );
  return row ? Number(row.value) : 0;
}

export async function migrate(db: Db, migrations: Migration[] = MIGRATIONS): Promise<void> {
  await db.exec([{ sql: 'CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)' }]);

  const current = await getSchemaVersion(db);
  for (const migration of migrations) {
    if (migration.version <= current) continue;
    await db.exec([
      { sql: migration.sql },
      {
        sql: "INSERT INTO meta (key, value) VALUES ('schema_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        bind: [String(migration.version)],
      },
    ]);
  }
}
