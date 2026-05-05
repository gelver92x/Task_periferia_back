import { type Request, type Response } from 'express';

import { type buildTaskContainer } from '../../../composition/task.container';
import { type CreateTaskDTO } from '../../../application/dtos/create-task.dto';
import { type UpdateTaskDTO } from '../../../application/dtos/update-task.dto';

type TaskContainer = ReturnType<typeof buildTaskContainer>;

export class TaskController {
  constructor(private readonly container: TaskContainer) {}

  getAll = async (_request: Request, response: Response): Promise<void> => {
    const tasks = await this.container.getAllTasksUseCase.execute();
    response.status(200).json(tasks);
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
