import { type TaskDTO } from '../../domain/entities/task.entity';
import { type TaskRepository } from '../../domain/repositories/task.repository';
import { type TaskStatus } from '../../domain/value-objects/task-status.vo';
import { NotFoundError } from '../errors/app-error';

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
};

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string, input: UpdateTaskInput): Promise<TaskDTO> {
    const updatedTask = await this.taskRepository.update(id, input);

    if (!updatedTask) {
      throw new NotFoundError('Task not found');
    }

    return updatedTask.toJSON();
  }
}

