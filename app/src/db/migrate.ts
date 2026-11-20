import type { Executor } from './types';

export interface Migration {
  version: number;
  sql: string;
}

const migrationFiles = import.meta.glob<string>('./migrations/*sql', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const MIGRATIONS: Migration[] = Object.entries(migrationFiles)
  .map(([path, sql]) => {
    const match = path.match(/\/(\d+)_[^/]+\.sql$/);
    if (!match) {
      throw new Error(`Invalid migration file path: ${path}`);
    }
    return { version: Number(match[1]), sql };
  })
  .sort((a, b) => a.version - b.version);

export function getSchemaVersion(executor: Executor): number {
  const [row] = executor.query<{ value: string }>(
    "SELECT value FROM meta WHERE key = 'schema_version'",
  );
  return row ? Number(row.value) : 0;
}

export function migrate(executor: Executor, migrations: Migration[] = MIGRATIONS) {
  executor.exec([
    { sql: 'CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)' },
  ]);

  const currentVersion = getSchemaVersion(executor);
  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }
    executor.exec([
      { sql: migration.sql },
      {
        sql: "INSERT INTO meta (key, value) VALUES ('schema_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        bind: [String(migration.version)],
      },
    ]);
  }
}
