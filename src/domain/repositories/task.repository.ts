import { type Task } from '../entities/task.entity';

export type TaskRepositoryUpdate = {
  title?: string;
  description?: string;
  status?: Task['status'];
};

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  update(id: string, data: TaskRepositoryUpdate): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}

