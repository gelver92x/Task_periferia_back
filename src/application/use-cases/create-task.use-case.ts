import { randomUUID } from 'node:crypto';

import { Task, type TaskDTO } from '../../domain/entities/task.entity';
import { type TaskRepository } from '../../domain/repositories/task.repository';
import { type TaskStatus } from '../../domain/value-objects/task-status.vo';

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
};

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<TaskDTO> {
    const task = Task.create({
      id: randomUUID(),
      title: input.title,
      description: input.description,
      status: input.status,
    });

    const savedTask = await this.taskRepository.save(task);
    return savedTask.toJSON();
  }
}

