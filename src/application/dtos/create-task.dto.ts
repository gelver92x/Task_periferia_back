import { z } from 'zod';

import { TASK_STATUSES } from '../../domain/value-objects/task-status.vo';

export const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().max(500).optional().default(''),
  status: z.enum(TASK_STATUSES).optional().default('pending'),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;

