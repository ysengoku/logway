import type { Db } from './types';

export interface Migration {
  version: number;
  sql: string;
}

// Migration files live in ./migrations and are named NNN_description.sql.
// Spec: tests/unit/db/migrate.test.ts
export const MIGRATIONS: Migration[] = [];

export async function getSchemaVersion(db: Db): Promise<number> {
  void db;
  throw new Error('Not implemented');
}

export async function migrate(db: Db, migrations: Migration[] = MIGRATIONS): Promise<void> {
  void db;
  void migrations;
  throw new Error('Not implemented');
}
