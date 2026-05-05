import { type TaskRepository } from '../../domain/repositories/task.repository';
import { NotFoundError } from '../errors/app-error';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.taskRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError('Task not found');
    }
  }
}

