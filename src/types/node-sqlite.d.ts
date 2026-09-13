declare module "node:sqlite" {
  export interface DatabaseSyncOptions {
    readOnly?: boolean;
    enableForeignKeyConstraints?: boolean;
    open?: boolean;
  }

  export interface StatementSync {
    all(...params: unknown[]): unknown[];
    get(...params: unknown[]): unknown;
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    sourceURL?: string;
    expandedSQL?: string;
  }

  export class DatabaseSync {
    constructor(location: string, options?: DatabaseSyncOptions);
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
