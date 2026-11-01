import type { SqlValue, Statement } from './types';
import type { Database } from '@sqlite.org/sqlite-wasm';

export interface Executor {
  query<T>(sql: string, bind?: SqlValue[]): T[];
  exec(statements: Statement[]): void;
}

// Shared by the Web Worker (OPFS-backed DB) and unit tests (in-memory DB).
// Spec: tests/unit/api/*.test.ts, tests/unit/db/migrate.test.ts
export function createExecutor(db: Database): Executor {
  void db;
  throw new Error('Not implemented');
}
