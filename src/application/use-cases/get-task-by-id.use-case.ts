import { type TaskDTO } from '../dtos/task.dto';
import { NotFoundError } from '../errors/app-error';
import { toTaskDTO } from '../mappers/task.mapper';
import { type TaskRepositoryPort } from '../ports/outbound/task-repository.port';

export class GetTaskByIdUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(id: string): Promise<TaskDTO> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return toTaskDTO(task);
  }
}

