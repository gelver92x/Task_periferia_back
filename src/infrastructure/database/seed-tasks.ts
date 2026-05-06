import { buildTaskContainer } from '../../composition/task.container';
import { closeDatabase } from './sqlite.connection';
import './run-migrations';

const TOTAL_TASKS = 100;
const STATUSES = ['pending', 'in_progress', 'done'] as const;

const seedTasks = async (): Promise<void> => {
  const { createTaskUseCase } = buildTaskContainer();

  for (let index = 1; index <= TOTAL_TASKS; index += 1) {
    await createTaskUseCase.execute({
      title: `Tarea de prueba ${index}`,
      description: `Descripcion generada para la tarea de prueba ${index}.`,
      status: STATUSES[(index - 1) % STATUSES.length],
    });
  }

  console.log(`${TOTAL_TASKS} tareas cargadas correctamente.`);
};

seedTasks()
  .catch((error: unknown) => {
    console.error('No se pudieron cargar las tareas.', error);
    process.exitCode = 1;
  })
  .finally(() => {
    closeDatabase();
  });
