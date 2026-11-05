import type { SqlValue, Statement } from './types';

export type WorkerCommand =
  { kind: 'query'; sql: string; bind?: SqlValue[] } | { kind: 'exec'; statements: Statement[] };

export type WorkerRequest = WorkerCommand & { id: number };

export type WorkerResponse =
  | { id: number; ok: true; result: Record<string, SqlValue>[] | number }
  | { id: number; ok: false; error: string };
