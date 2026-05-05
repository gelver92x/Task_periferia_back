import { Router } from 'express';
import { z } from 'zod';

import { createTaskSchema } from '../../../application/dtos/create-task.dto';
import { updateTaskSchema } from '../../../application/dtos/update-task.dto';
import { buildTaskContainer } from '../../../composition/task.container';
import { TaskController } from '../controllers/task.controller';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { validate } from '../middlewares/validate.middleware';

const idParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const createTaskRouter = (): Router => {
  const router = Router();
  const controller = new TaskController(buildTaskContainer());

  router.get('/', asyncHandler(controller.getAll));
  router.get('/:id', validate(idParamsSchema, 'params'), asyncHandler(controller.getById));
  router.post('/', validate(createTaskSchema), asyncHandler(controller.create));
  router.put(
    '/:id',
    validate(idParamsSchema, 'params'),
    validate(updateTaskSchema),
    asyncHandler(controller.update),
  );
  router.delete('/:id', validate(idParamsSchema, 'params'), asyncHandler(controller.delete));

  return router;
};

