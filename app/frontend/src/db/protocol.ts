import type { SqlValue, Statement } from './types';

export type WorkerRequest =
  | { id: number; kind: 'query'; sql: string; bind?: SqlValue[] }
  | { id: number; kind: 'exec'; statements: Statement[] };

export type WorkerResponse =
  | { id: number; ok: true; rows?: unknown[] }
  | { id: number; ok: false; error: string };
