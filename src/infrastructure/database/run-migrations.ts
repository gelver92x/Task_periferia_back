import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { closeDatabase, getDatabase } from './sqlite.connection';

const runMigrations = (): void => {
  const database = getDatabase();
  const migrationsPath = path.resolve(__dirname, 'migrations');
  const migrationFiles = readdirSync(migrationsPath)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      executed_at TEXT NOT NULL
    );
  `);

  const hasMigration = database.prepare('SELECT id FROM schema_migrations WHERE id = ?');
  const recordMigration = database.prepare(
    'INSERT INTO schema_migrations (id, executed_at) VALUES (?, ?)',
  );

  const transaction = database.transaction(() => {
    for (const file of migrationFiles) {
      if (hasMigration.get(file)) {
        continue;
      }

      const sql = readFileSync(path.join(migrationsPath, file), 'utf8');
      database.exec(sql);
      recordMigration.run(file, new Date().toISOString());
    }
  });

  transaction();
  closeDatabase();
};

runMigrations();

