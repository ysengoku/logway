import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { createExecutor } from './executor';
import type { WorkerRequest, WorkerResponse } from './protocol';

const DB_FILE = '/logway.sqlite3';

const ready = (async () => {
  const sqlite3 = await sqlite3InitModule();
  try {
    // opfs-sahpool persists to the Origin Private File System and, unlike the
    // plain "opfs" VFS, does not require COOP/COEP headers.
    const pool = await sqlite3.installOpfsSAHPoolVfs({ name: 'logway' });
    return createExecutor(new pool.OpfsSAHPoolDb(DB_FILE));
  } catch (e) {
    console.warn('OPFS is unavailable; data will not persist across reloads.', e);
    return createExecutor(new sqlite3.oo1.DB(':memory:'));
  }
})();

function respond(response: WorkerResponse) {
  self.postMessage(response);
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  try {
    const executor = await ready;
    if (request.kind === 'query') {
      respond({ id: request.id, ok: true, rows: executor.query(request.sql, request.bind) });
    } else {
      executor.exec(request.statements);
      respond({ id: request.id, ok: true });
    }
  } catch (e) {
    respond({ id: request.id, ok: false, error: e instanceof Error ? e.message : String(e) });
  }
};
