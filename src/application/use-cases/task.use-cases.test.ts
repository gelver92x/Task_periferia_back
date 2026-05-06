import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { Task } from '../../domain/entities/task.entity';
import { CreateTaskUseCase } from './create-task.use-case';
import { DeleteTaskUseCase } from './delete-task.use-case';
import { GetAllTasksUseCase } from './get-all-tasks.use-case';
import { GetTaskByIdUseCase } from './get-task-by-id.use-case';
import { UpdateTaskUseCase } from './update-task.use-case';
import { NotFoundError } from '../errors/app-error';
import { type IdGeneratorPort } from '../ports/outbound/id-generator.port';
import { type PagedResult, type TaskRepositoryPort } from '../ports/outbound/task-repository.port';

class FixedIdGenerator implements IdGeneratorPort {
  generate(): string {
    return 'task-1';
  }
}

class InMemoryTaskRepository implements TaskRepositoryPort {
  private readonly tasks = new Map<string, Task>();

  seed(task: Task): void {
    this.tasks.set(task.id, task);
  }

  async findPaginated(page: number, limit: number, status?: string): Promise<PagedResult<Task>> {
    let allData = Array.from(this.tasks.values());
    if (status) {
      allData = allData.filter(t => t.status === status);
    }
    const data = allData.slice((page - 1) * limit, page * limit);

    const allTasks = Array.from(this.tasks.values());
    const pending = allTasks.filter(t => t.status === 'pending').length;
    const inProgress = allTasks.filter(t => t.status === 'in_progress').length;
    const done = allTasks.filter(t => t.status === 'done').length;

    return {
      data,
      total: allData.length,
      page,
      limit,
      hasMore: page * limit < allData.length,
      stats: { pending, inProgress, done }
    };
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null;
  }

  async save(task: Task): Promise<Task> {
    this.tasks.set(task.id, task);
    return task;
  }

  async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }
}

describe('task use cases', () => {
  it('creates a task with generated id and current response shape', async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository, new FixedIdGenerator());

    const result = await useCase.execute({ title: 'New task' });

    assert.equal(result.id, 'task-1');
    assert.equal(result.title, 'New task');
    assert.equal(result.description, '');
    assert.equal(result.status, 'pending');
    assert.match(result.createdAt, /^\d{4}-\d{2}-\d{2}T/);
    assert.match(result.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
  });

  it('returns paginated tasks with the frontend contract', async () => {
    const repository = new InMemoryTaskRepository();
    repository.seed(createExistingTask('task-1', 'First task'));
    repository.seed(createExistingTask('task-2', 'Second task'));

    const result = await new GetAllTasksUseCase(repository).execute(1, 1);

    assert.deepEqual(Object.keys(result), ['data', 'total', 'page', 'limit', 'hasMore', 'stats']);
    assert.equal(result.data.length, 1);
    assert.equal(result.total, 2);
    assert.equal(result.page, 1);
    assert.equal(result.limit, 1);
    assert.equal(result.hasMore, true);
  });

  it('gets a task by id', async () => {
    const repository = new InMemoryTaskRepository();
    repository.seed(createExistingTask('task-1', 'Existing task'));

    const result = await new GetTaskByIdUseCase(repository).execute('task-1');

    assert.equal(result.id, 'task-1');
    assert.equal(result.title, 'Existing task');
  });

  it('updates a task through domain behavior before saving', async () => {
    const repository = new InMemoryTaskRepository();
    repository.seed(createExistingTask('task-1', 'Existing task'));

    const result = await new UpdateTaskUseCase(repository).execute('task-1', {
      title: 'Updated task',
      status: 'done',
    });

    assert.equal(result.title, 'Updated task');
    assert.equal(result.status, 'done');
  });

  it('throws not found when updating or deleting missing tasks', async () => {
    const repository = new InMemoryTaskRepository();

    await assert.rejects(
      () => new UpdateTaskUseCase(repository).execute('missing', { title: 'Updated task' }),
      NotFoundError,
    );
    await assert.rejects(() => new DeleteTaskUseCase(repository).execute('missing'), NotFoundError);
  });
});

const createExistingTask = (id: string, title: string): Task =>
  Task.rehydrate({
    id,
    title,
    description: '',
    status: 'pending',
    createdAt: new Date('2026-05-05T22:00:00.000Z'),
    updatedAt: new Date('2026-05-05T22:00:00.000Z'),
  });
