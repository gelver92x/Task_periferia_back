import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { type AddressInfo } from 'node:net';
import { type Server } from 'node:http';

process.env.DB_PATH = path.join(mkdtempSync(path.join(tmpdir(), 'task-api-')), 'tasks.db');

let closeDatabase: () => void;
let server: Server;
let baseUrl: string;

before(async () => {
  const databaseModule = await import('../../infrastructure/database/sqlite.connection');
  const appModule = await import('./app');
  const database = databaseModule.getDatabase();
  closeDatabase = databaseModule.closeDatabase;

  database.exec(`
    CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  server = appModule.createApp().listen(0);
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(() => {
  server.close();
  closeDatabase();
});

describe('task HTTP adapter', () => {
  it('keeps the health response contract', async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: 'ok' });
  });

  it('keeps create, list, update and delete contracts', async () => {
    const createResponse = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'HTTP task', description: 'Created from test' }),
    });
    const created = await createResponse.json();

    assert.equal(createResponse.status, 201);
    assert.equal(created.title, 'HTTP task');
    assert.equal(created.description, 'Created from test');
    assert.equal(created.status, 'pending');
    assert.match(created.id, /^[0-9a-f-]{36}$/);

    const listResponse = await fetch(`${baseUrl}/tasks?page=1&limit=9`);
    const list = await listResponse.json();

    assert.equal(listResponse.status, 200);
    assert.deepEqual(Object.keys(list), ['data', 'total', 'page', 'limit', 'hasMore']);
    assert.equal(list.total, 1);
    assert.equal(list.page, 1);
    assert.equal(list.limit, 9);

    const updateResponse = await fetch(`${baseUrl}/tasks/${created.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    const updated = await updateResponse.json();

    assert.equal(updateResponse.status, 200);
    assert.equal(updated.id, created.id);
    assert.equal(updated.status, 'done');

    const deleteResponse = await fetch(`${baseUrl}/tasks/${created.id}`, { method: 'DELETE' });

    assert.equal(deleteResponse.status, 204);
    assert.equal(await deleteResponse.text(), '');
  });

  it('keeps validation and not found error contracts', async () => {
    const validationResponse = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'no' }),
    });
    const validationError = await validationResponse.json();

    assert.equal(validationResponse.status, 422);
    assert.equal(validationError.error, true);
    assert.equal(validationError.status, 422);
    assert.equal(validationError.message, 'Validation failed');
    assert.ok(Array.isArray(validationError.details));
    assert.match(validationError.timestamp, /^\d{4}-\d{2}-\d{2}T/);

    const notFoundResponse = await fetch(`${baseUrl}/tasks/missing`);
    const notFoundError = await notFoundResponse.json();

    assert.equal(notFoundResponse.status, 404);
    assert.equal(notFoundError.error, true);
    assert.equal(notFoundError.status, 404);
    assert.equal(notFoundError.message, 'Task not found');
    assert.match(notFoundError.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  });
});
