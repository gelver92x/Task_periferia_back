import { type Database } from 'better-sqlite3';

import { Task } from '../../domain/entities/task.entity';
import {
  type PagedResult,
  type TaskRepositoryPort,
} from '../../application/ports/outbound/task-repository.port';
import { isTaskStatus } from '../../domain/value-objects/task-status.vo';

type TaskRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export class SQLiteTaskRepository implements TaskRepositoryPort {
  constructor(private readonly database: Database) {}

  async findPaginated(page: number, limit: number): Promise<PagedResult<Task>> {
    const offset = (page - 1) * limit;
    const rows = this.database
      .prepare('SELECT * FROM tasks ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?')
      .all(limit, offset) as TaskRow[];
    const total = (this.database
      .prepare('SELECT COUNT(*) as count FROM tasks')
      .get() as { count: number }).count;
    return {
      data:    rows.map((row) => this.toDomain(row)),
      total,
      page,
      limit,
      hasMore: offset + rows.length < total,
    };
  }

  async findById(id: string): Promise<Task | null> {
    const row = this.database.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as
      | TaskRow
      | undefined;

    return row ? this.toDomain(row) : null;
  }

  async save(task: Task): Promise<Task> {
    const snapshot = task.toSnapshot();

    this.database
      .prepare(
        `
        INSERT INTO tasks (id, title, description, status, created_at, updated_at)
        VALUES (@id, @title, @description, @status, @createdAt, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          description = excluded.description,
          status = excluded.status,
          updated_at = excluded.updated_at
      `,
      )
      .run({
        id: snapshot.id,
        title: snapshot.title,
        description: snapshot.description,
        status: snapshot.status,
        createdAt: snapshot.createdAt.toISOString(),
        updatedAt: snapshot.updatedAt.toISOString(),
      });

    return task;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.database.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  }

  private toDomain(row: TaskRow): Task {
    if (!isTaskStatus(row.status)) {
      throw new Error(`Invalid task status persisted: ${row.status}`);
    }

    return Task.rehydrate({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

