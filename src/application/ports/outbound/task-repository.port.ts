import { type Task } from '../../../domain/entities/task.entity';

export type TaskRepositoryUpdate = {
  title?: string;
  description?: string;
  status?: Task['status'];
};

export type PagedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export interface TaskRepositoryPort {
  findPaginated(page: number, limit: number): Promise<PagedResult<Task>>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  delete(id: string): Promise<boolean>;
}

