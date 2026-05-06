import { type Request, type Response } from 'express';

import { type buildTaskContainer } from '../../../composition/task.container';
import { type CreateTaskDTO } from '../../../application/dtos/create-task.dto';
import { type UpdateTaskDTO } from '../../../application/dtos/update-task.dto';
import { isTaskStatus } from '../../../domain/value-objects/task-status.vo';

type TaskContainer = ReturnType<typeof buildTaskContainer>;

export class TaskController {
  constructor(private readonly container: TaskContainer) {}

  getAll = async (request: Request, response: Response): Promise<void> => {
    const page   = Math.max(1, parseInt(request.query['page']  as string) || 1);
    const limit  = Math.min(50, Math.max(1, parseInt(request.query['limit'] as string) || 9));
    const rawStatus = request.query['status'] as string | undefined;
    const status = rawStatus && isTaskStatus(rawStatus) ? rawStatus : undefined;

    const result = await this.container.getAllTasksUseCase.execute(page, limit, status);
    response.status(200).json(result);
  };

  getById = async (request: Request, response: Response): Promise<void> => {
    const task = await this.container.getTaskByIdUseCase.execute(this.getTaskId(request));
    response.status(200).json(task);
  };

  create = async (request: Request, response: Response): Promise<void> => {
    const task = await this.container.createTaskUseCase.execute(request.body as CreateTaskDTO);
    response.status(201).json(task);
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const task = await this.container.updateTaskUseCase.execute(
      this.getTaskId(request),
      request.body as UpdateTaskDTO,
    );
    response.status(200).json(task);
  };

  delete = async (request: Request, response: Response): Promise<void> => {
    await this.container.deleteTaskUseCase.execute(this.getTaskId(request));
    response.status(204).send();
  };

  private getTaskId(request: Request): string {
    return request.params.id as string;
  }
}
