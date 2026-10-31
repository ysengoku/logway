import { migrate } from './migrate';
import type { WorkerRequest, WorkerResponse } from './protocol';
import type { Db, SqlValue, Statement } from './types';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

function createWorkerDb(worker: Worker): Db {
  let nextId = 1;
  const pending = new Map<number, { resolve: (rows?: unknown[]) => void; reject: (e: Error) => void }>();

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const response = event.data;
    const handlers = pending.get(response.id);
    if (!handlers) return;
    pending.delete(response.id);
    if (response.ok) {
      handlers.resolve(response.rows);
    } else {
      handlers.reject(new Error(response.error));
    }
  };

  function send(request: DistributiveOmit<WorkerRequest, 'id'>): Promise<unknown[] | undefined> {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ ...request, id });
    });
  }

  return {
    async query<T>(sql: string, bind?: SqlValue[]) {
      return ((await send({ kind: 'query', sql, bind })) ?? []) as T[];
    },
    async exec(statements: Statement[]) {
      await send({ kind: 'exec', statements });
    },
  };
}

let dbPromise: Promise<Db> | null = null;

export function getDb(): Promise<Db> {
  dbPromise ??= (async () => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    const db = createWorkerDb(worker);
    await migrate(db);
    return db;
  })();
  return dbPromise;
}
