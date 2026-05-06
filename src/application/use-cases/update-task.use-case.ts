import { type TaskStatus } from '../../domain/value-objects/task-status.vo';
import { type TaskDTO } from '../dtos/task.dto';
import { NotFoundError } from '../errors/app-error';
import { toTaskDTO } from '../mappers/task.mapper';
import { type TaskRepositoryPort } from '../ports/outbound/task-repository.port';

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
};

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(id: string, input: UpdateTaskInput): Promise<TaskDTO> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (input.title !== undefined) {
      task.rename(input.title);
    }

    if (input.description !== undefined) {
      task.updateDescription(input.description);
    }

    if (input.status !== undefined) {
      task.changeStatus(input.status);
    }

    const updatedTask = await this.taskRepository.save(task);

    return toTaskDTO(updatedTask);
  }
}

