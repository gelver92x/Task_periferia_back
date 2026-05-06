import { type TaskStatus } from '../../domain/value-objects/task-status.vo';

export type UpdateTaskDTO = {
  title?: string;
  description?: string;
  status?: TaskStatus;
};

