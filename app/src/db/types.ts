export type SqlValue = string | number | null;

export interface Statement {
  sql: string;
  bind?: SqlValue[];
}

export interface Db {
  query<T>(sql: string, bind?: SqlValue[]): Promise<T[]>;
  // Runs all statements in a single transaction.
  exec(statements: Statement[]): Promise<number>;
}
