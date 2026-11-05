import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { createExecutor } from '@/db/executor';
import { migrate } from '@/db/migrate';
import type { Db } from '@/db/types';

const sqlite3Promise = sqlite3InitModule();

// Same SQL execution path as the Web Worker, but in-memory and in-process.
export async function createMemoryDb({ migrated = true } = {}): Promise<Db> {
  const sqlite3 = await sqlite3Promise;
  const executor = createExecutor(new sqlite3.oo1.DB(':memory:'));
  const db: Db = {
    async query<T>(sql: string, bind?: Parameters<Db['query']>[1]) {
      return executor.query<T>(sql, bind);
    },
    async exec(statements) {
      return executor.exec(statements);
    },
  };
  if (migrated) await migrate(db);
  return db;
}
