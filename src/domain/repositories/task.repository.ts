import { type Task } from '../entities/task.entity';

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

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findPaginated(page: number, limit: number): Promise<PagedResult<Task>>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  update(id: string, data: TaskRepositoryUpdate): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}

