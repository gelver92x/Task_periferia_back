import { Task } from '../../domain/entities/task.entity';
import { type TaskStatus } from '../../domain/value-objects/task-status.vo';
import { type TaskDTO } from '../dtos/task.dto';
import { toTaskDTO } from '../mappers/task.mapper';
import { type IdGeneratorPort } from '../ports/outbound/id-generator.port';
import { type TaskRepositoryPort } from '../ports/outbound/task-repository.port';

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
};

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly idGenerator: IdGeneratorPort,
  ) {}

  async execute(input: CreateTaskInput): Promise<TaskDTO> {
    const task = Task.create({
      id: this.idGenerator.generate(),
      title: input.title,
      description: input.description,
      status: input.status,
    });

    const savedTask = await this.taskRepository.save(task);
    return toTaskDTO(savedTask);
  }
}

