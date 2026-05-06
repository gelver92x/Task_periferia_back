import { type Task } from '../../../domain/entities/task.entity';
import { type TaskStatus } from '../../../domain/value-objects/task-status.vo';

export type TaskRepositoryUpdate = {
  title?: string;
  description?: string;
  status?: Task['status'];
};

export type TaskStats = {
  pending:    number;
  inProgress: number;
  done:       number;
};

export type PagedResult<T> = {
  data:    T[];
  total:   number;
  page:    number;
  limit:   number;
  hasMore: boolean;
  stats:   TaskStats;
};

export interface TaskRepositoryPort {
  findPaginated(page: number, limit: number, status?: TaskStatus): Promise<PagedResult<Task>>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  delete(id: string): Promise<boolean>;
}

