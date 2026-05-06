import { type TaskStatus } from '../../domain/value-objects/task-status.vo';

export type TaskDTO = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

