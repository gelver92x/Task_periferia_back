import { type TaskDTO } from '../../domain/entities/task.entity';
import { type TaskRepository } from '../../domain/repositories/task.repository';
import { NotFoundError } from '../errors/app-error';

export class GetTaskByIdUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string): Promise<TaskDTO> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task.toJSON();
  }
}

