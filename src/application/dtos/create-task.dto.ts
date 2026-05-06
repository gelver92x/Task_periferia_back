import { type TaskStatus } from '../../domain/value-objects/task-status.vo';

export type CreateTaskDTO = {
  title: string;
  description?: string;
  status?: TaskStatus;
};

