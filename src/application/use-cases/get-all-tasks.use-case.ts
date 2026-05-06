import { type TaskDTO } from '../../domain/entities/task.entity';
import { type TaskRepository, type PagedResult } from '../../domain/repositories/task.repository';

export type PagedTaskResult = PagedResult<TaskDTO>;

export class GetAllTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(page = 1, limit = 9): Promise<PagedTaskResult> {
    const result = await this.taskRepository.findPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((task) => task.toJSON()),
    };
  }
}

