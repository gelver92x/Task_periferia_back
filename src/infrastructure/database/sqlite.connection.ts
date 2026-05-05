import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

dotenv.config();

let connection: Database.Database | null = null;

export const getDatabase = (): Database.Database => {
  if (connection) {
    return connection;
  }

  const dbPath = process.env.DB_PATH ?? './data/tasks.db';
  const resolvedPath = path.resolve(process.cwd(), dbPath);
  mkdirSync(path.dirname(resolvedPath), { recursive: true });

  connection = new Database(resolvedPath);
  connection.pragma('foreign_keys = ON');

  return connection;
};

export const closeDatabase = (): void => {
  connection?.close();
  connection = null;
};

