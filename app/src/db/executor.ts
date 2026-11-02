import type { SqlValue, Statement } from './types';
import type { Database } from '@sqlite.org/sqlite-wasm';

export interface Executor {
  query<T>(sql: string, bind?: SqlValue[]): T[];
  exec(statements: Statement[]): number;
}

class SqliteExecutor implements Executor {
  constructor(private readonly db: Database) {
    this.db.exec('PRAGMA foreign_keys = ON');
  }

  query<T>(sql: string, bind?: SqlValue[]): T[] {
    const rows = this.db.exec({
      sql: sql,
      bind: bind,
      rowMode: 'object',
      returnValue: 'resultRows',
    });
    return rows.map((row) => ({ ...row }) as T);
  }

  exec(statements: Statement[]): number {
    let changes = 0;
    this.db.transaction(() => {
      for (const { sql, bind } of statements) {
        this.db.exec({ sql: sql, bind: bind });
        changes += this.db.changes();
      }
    });
    return changes;
  }
}

export function createExecutor(db: Database): Executor {
  return new SqliteExecutor(db);
}
