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

  async findPaginated(page: number, limit: number, status?: string): Promise<PagedResult<Task>> {
    const offset = (page - 1) * limit;

    // Fetch the page (filtered if status provided)
    const dataQuery = status
      ? 'SELECT * FROM tasks WHERE status = ? ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?'
      : 'SELECT * FROM tasks ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?';
    const dataParams: (string | number)[] = status ? [status, limit, offset] : [limit, offset];
    const rows = this.database.prepare(dataQuery).all(...dataParams) as TaskRow[];

    // Filtered total (for hasMore / pagination calculation)
    const filteredTotal = status
      ? (this.database.prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?').get(status) as { count: number }).count
      : (this.database.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }).count;

    // Global stats — always count ALL tasks regardless of the active filter
    const statsRows = this.database
      .prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status')
      .all() as { status: string; count: number }[];

    const statsMap = new Map(statsRows.map((r) => [r.status, r.count]));
    const stats = {
      pending:    statsMap.get('pending')     ?? 0,
      inProgress: statsMap.get('in_progress') ?? 0,
      done:       statsMap.get('done')        ?? 0,
    };

    return {
      data:    rows.map((row) => this.toDomain(row)),
      total:   filteredTotal,
      page,
      limit,
      hasMore: offset + rows.length < filteredTotal,
      stats,
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
