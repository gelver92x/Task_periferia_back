import { type Task } from '../../domain/entities/task.entity';
import { type TaskDTO } from '../dtos/task.dto';

export const toTaskDTO = (task: Task): TaskDTO => {
  const snapshot = task.toSnapshot();

  return {
    id: snapshot.id,
    title: snapshot.title,
    description: snapshot.description,
    status: snapshot.status,
    createdAt: snapshot.createdAt.toISOString(),
    updatedAt: snapshot.updatedAt.toISOString(),
  };
};

