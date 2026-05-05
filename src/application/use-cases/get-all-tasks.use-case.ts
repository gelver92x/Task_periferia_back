import { type TaskDTO } from '../../domain/entities/task.entity';
import { type TaskRepository } from '../../domain/repositories/task.repository';

export class GetAllTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(): Promise<TaskDTO[]> {
    const tasks = await this.taskRepository.findAll();
    return tasks.map((task) => task.toJSON());
  }
}

