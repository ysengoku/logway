import type { SqlValue, Statement } from './types';

export type WorkerCommand =
  | { kind: 'query'; sql: string; bind?: SqlValue[] }
  | { kind: 'exec'; statements: Statement[] }
  | { kind: 'export' }
  | { kind: 'import'; bytes: Uint8Array; maxSchemaVersion: number };

export type WorkerRequest = WorkerCommand & { id: number };

export type WorkerResponse =
  | { id: number; ok: true; result: Record<string, SqlValue>[] | number | Uint8Array | null }
  | { id: number; ok: false; error: string };
