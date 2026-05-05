import { GetAllTasksUseCase } from '../application/use-cases/get-all-tasks.use-case';
import { GetTaskByIdUseCase } from '../application/use-cases/get-task-by-id.use-case';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../application/use-cases/delete-task.use-case';
import { getDatabase } from '../infrastructure/database/sqlite.connection';
import { SQLiteTaskRepository } from '../infrastructure/repositories/sqlite-task.repository';

export const buildTaskContainer = () => {
  const taskRepository = new SQLiteTaskRepository(getDatabase());

  return {
    getAllTasksUseCase: new GetAllTasksUseCase(taskRepository),
    getTaskByIdUseCase: new GetTaskByIdUseCase(taskRepository),
    createTaskUseCase: new CreateTaskUseCase(taskRepository),
    updateTaskUseCase: new UpdateTaskUseCase(taskRepository),
    deleteTaskUseCase: new DeleteTaskUseCase(taskRepository),
  };
};

