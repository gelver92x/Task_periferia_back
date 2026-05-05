import { z } from 'zod';

import { TASK_STATUSES } from '../../domain/value-objects/task-status.vo';

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(3).max(100).optional(),
    description: z.string().trim().max(500).optional(),
    status: z.enum(TASK_STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;

