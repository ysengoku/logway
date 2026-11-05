import { migrate } from './migrate';
import type { WorkerCommand, WorkerResponse } from './protocol';
import type { Db, SqlValue, Statement } from './types';

type WorkerResult = Extract<WorkerResponse, { ok: true }>['result'];

interface PendingRequest {
  resolve: (result: WorkerResult) => void;
  reject: (error: Error) => void;
}

class DbClient implements Db {
  private nextId = 1;
  private readonly pending = new Map<number, PendingRequest>();

  constructor(private readonly worker: Worker) {
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => this.onResponse(event.data);
    worker.onerror = (event) => {
      const error = new Error(event.message || 'Database worker failed');
      for (const request of this.pending.values()) {
        request.reject(error);
      }
      this.pending.clear();
    };
  }

  async query<T>(sql: string, bind?: SqlValue[]): Promise<T[]> {
    return (await this.send({ kind: 'query', sql, bind })) as T[];
  }

  async exec(statements: Statement[]): Promise<number> {
    return (await this.send({ kind: 'exec', statements })) as number;
  }

  private send(message: WorkerCommand) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ ...message, id });
    });
  }

  private onResponse(response: WorkerResponse) {
    const request = this.pending.get(response.id);
    if (!request) {
      return;
    }
    if (response.ok) {
      request.resolve(response.result);
    } else {
      request.reject(new Error(response.error));
    }
    this.pending.delete(response.id);
  }
}

let dbPromise: Promise<DbClient> | null = null;

export function getDb(): Promise<DbClient> {
  dbPromise ??= (async () => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    const db = new DbClient(worker);
    await migrate(db);
    return db;
  })();
  return dbPromise;
}
