import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { env } from '../../shared/config/env';

let connection: Database.Database | null = null;

export const getDatabase = (): Database.Database => {
  if (connection) {
    return connection;
  }

  const resolvedPath = path.resolve(process.cwd(), env.dbPath);
  mkdirSync(path.dirname(resolvedPath), { recursive: true });

  connection = new Database(resolvedPath);
  connection.pragma('foreign_keys = ON');

  return connection;
};

export const closeDatabase = (): void => {
  connection?.close();
  connection = null;
};

