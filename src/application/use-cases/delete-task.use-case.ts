import { NotFoundError } from '../errors/app-error';
import { type TaskRepositoryPort } from '../ports/outbound/task-repository.port';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.taskRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError('Task not found');
    }
  }
}

