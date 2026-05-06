import { type TaskDTO } from '../dtos/task.dto';
import { toTaskDTO } from '../mappers/task.mapper';
import { type TaskRepositoryPort, type PagedResult } from '../ports/outbound/task-repository.port';

export type PagedTaskResult = PagedResult<TaskDTO>;

export class GetAllTasksUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(page = 1, limit = 9): Promise<PagedTaskResult> {
    const result = await this.taskRepository.findPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(toTaskDTO),
    };
  }
}

