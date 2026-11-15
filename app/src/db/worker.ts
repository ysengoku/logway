import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { createExecutor } from './executor';
import type { Database, SAHPoolUtil } from '@sqlite.org/sqlite-wasm';
import type { Executor } from './executor';
import type { WorkerRequest, WorkerResponse } from './protocol';
import type { SqlValue } from './types';

const DB_NAME = 'logway';
const DB_PATH = '/logway.sqlite3';
const TEMP_PATH = '/incoming.sqlite3';

class DbWorker {
  private db: Database | null = null;
  private pool: SAHPoolUtil | null = null;
  private executor: Executor | null = null;
  private readonly ready = this.init();

  private async init() {
    const sqlite3 = await sqlite3InitModule();
    this.pool = await sqlite3.installOpfsSAHPoolVfs({ name: DB_NAME });
    this.openDb(this.pool);
  }

  private openDb(pool: SAHPoolUtil) {
    this.db = new pool.OpfsSAHPoolDb(DB_PATH);
    this.executor = createExecutor(this.db);
  }

  private async validate(pool: SAHPoolUtil, bytes: Uint8Array, maxSchemaVersion: number) {
    let tempDb: Database | null = null;
    try {
      await pool.importDb(TEMP_PATH, bytes);
      tempDb = new pool.OpfsSAHPoolDb(TEMP_PATH);

      if (tempDb.selectValue('PRAGMA integrity_check') !== 'ok') {
        throw new Error('Downloaded database is corrupted');
      }

      const version = Number(
        tempDb.selectValue("SELECT value FROM meta WHERE key = 'schema_version'") ?? 0,
      );
      if (version > maxSchemaVersion) {
        throw new Error('Downloaded database is newer than this app');
      }
    } finally {
      tempDb?.close();
      pool.unlink(TEMP_PATH);
    }
  }

  async handle(request: WorkerRequest): Promise<WorkerResponse> {
    try {
      await this.ready;
      switch (request.kind) {
        case 'query':
          if (!this.executor) {
            throw new Error('Database is not available');
          }
          return {
            id: request.id,
            ok: true,
            result: this.executor.query<Record<string, SqlValue>>(request.sql, request.bind),
          };
        case 'exec':
          if (!this.executor) {
            throw new Error('Database is not available');
          }
          return {
            id: request.id,
            ok: true,
            result: this.executor.exec(request.statements),
          };
        case 'export':
          if (!this.pool) {
            throw new Error('Database is not available');
          }
          return {
            id: request.id,
            ok: true,
            result: this.pool.exportFile(DB_PATH),
          };
        case 'import':
          if (!this.db || !this.pool) {
            throw new Error('Database is not available');
          }
          await this.validate(this.pool, request.bytes, request.maxSchemaVersion);
          this.db.close();
          try {
            await this.pool.importDb(DB_PATH, request.bytes);
          } finally {
            this.openDb(this.pool);
          }
          return { id: request.id, ok: true, result: null };
      }
    } catch (e) {
      return {
        id: request.id,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }
}

const dbWorker = new DbWorker();
let queue = Promise.resolve();

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  queue = queue
    .then(() => dbWorker.handle(event.data))
    .then((response) => self.postMessage(response))
    .catch(() => {});
};
