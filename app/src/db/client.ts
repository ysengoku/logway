import type { Db } from './types';

// Returns the app-wide database, backed by the Web Worker in ./worker.ts.
export function getDb(): Promise<Db> {
  throw new Error('Not implemented');
}
