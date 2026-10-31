import type { SqlValue, Statement } from '@/db/types';

// Keeps only whitelisted columns that are present in the body. `undefined`
// means "not provided" (left unchanged); `null` clears the column.
export function pickColumns(
  body: object,
  columns: readonly string[],
): [column: string, value: SqlValue][] {
  const record = body as Record<string, unknown>;
  return columns
    .filter((column) => record[column] !== undefined)
    .map((column) => [column, (record[column] ?? null) as SqlValue]);
}

export function insertStatement(table: string, values: [string, SqlValue][]): Statement {
  const columns = values.map(([column]) => column);
  return {
    sql: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    bind: values.map(([, value]) => value),
  };
}

export function updateStatement(table: string, id: string, values: [string, SqlValue][]): Statement {
  return {
    sql: `UPDATE ${table} SET ${values.map(([column]) => `${column} = ?`).join(', ')} WHERE id = ?`,
    bind: [...values.map(([, value]) => value), id],
  };
}
