export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const isTaskStatus = (value: string): value is TaskStatus =>
  TASK_STATUSES.includes(value as TaskStatus);

