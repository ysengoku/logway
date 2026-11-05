import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { createExecutor } from './executor';
import type { Executor } from './executor';
import type { WorkerRequest, WorkerResponse } from './protocol';
import type { SqlValue } from './types';

const DB_NAME = 'logway';
const DB_PATH = '/logway.sqlite3';

class DbWorker {
  private readonly executorReady = this.open();

  private async open(): Promise<Executor> {
    const sqlite3 = await sqlite3InitModule();
    const pool = await sqlite3.installOpfsSAHPoolVfs({ name: DB_NAME });
    return createExecutor(new pool.OpfsSAHPoolDb(DB_PATH));
  }

  async handle(request: WorkerRequest): Promise<WorkerResponse> {
    try {
      const executor = await this.executorReady;
      switch (request.kind) {
        case 'query':
          return {
            id: request.id,
            ok: true,
            result: executor.query<Record<string, SqlValue>>(request.sql, request.bind),
          };
        case 'exec':
          return {
            id: request.id,
            ok: true,
            result: executor.exec(request.statements),
          };
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

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  self.postMessage(await dbWorker.handle(event.data));
};
