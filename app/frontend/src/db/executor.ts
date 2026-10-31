import type { SqlValue, Statement } from './types';
import type { Database } from '@sqlite.org/sqlite-wasm';

export interface Executor {
  query<T>(sql: string, bind?: SqlValue[]): T[];
  exec(statements: Statement[]): void;
}

// Shared by the Web Worker (OPFS-backed DB) and unit tests (in-memory DB).
export function createExecutor(db: Database): Executor {
  db.exec('PRAGMA foreign_keys = ON');

  return {
    query<T>(sql: string, bind?: SqlValue[]): T[] {
      const rows = db.exec({ sql, bind, rowMode: 'object', returnValue: 'resultRows' });
      // Rows come back with a null prototype; copy them into plain objects.
      return rows.map((row) => ({ ...row }) as T);
    },
    exec(statements: Statement[]) {
      db.transaction(() => {
        for (const { sql, bind } of statements) {
          db.exec({ sql, bind });
        }
      });
    },
  };
}
