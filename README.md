# Task Manager — API REST

API REST para la gestión de tareas. Construida con **Node.js**, **Express**, **TypeScript** y **SQLite**, siguiendo una **Arquitectura Hexagonal (Ports & Adapters)**.

---

## Tabla de Contenidos

1. [Requisitos](#requisitos)
2. [Instalación](#instalación)
3. [Variables de Entorno](#variables-de-entorno)
4. [Scripts](#scripts)
5. [Endpoints](#endpoints)
6. [Modelo de Datos](#modelo-de-datos)
7. [Códigos de Estado HTTP](#códigos-de-estado-http)
8. [Arquitectura](#arquitectura)
9. [Estructura de Carpetas](#estructura-de-carpetas)

---

## Requisitos

- **Node.js 20+ LTS**
- **npm 9+**

---

## Instalación

```bash
# 1. Entrar al directorio
cd Task_periferia_back

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Ejecutar la migración de base de datos
npm run db:migrate

# 5. Iniciar el servidor de desarrollo
npm run dev
```

El servidor queda disponible en:

```
http://localhost:3000
```

---

## Variables de Entorno

| Variable | Valor por defecto | Descripción |
|----------|------------------|-------------|
| `PORT` | `3000` | Puerto del servidor HTTP |
| `DB_PATH` | `./data/tasks.db` | Ruta al archivo SQLite |
| `ALLOWED_ORIGINS` | `http://localhost:4200` | Orígenes CORS permitidos |

---

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con recarga automática (`tsx watch`) |
| `npm start` | Inicia el servidor compilado |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run db:migrate` | Ejecuta las migraciones SQL |
| `npm run lint` | Verifica el estilo de código con ESLint |

---

## Endpoints

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| `GET` | `/health` | Estado del servidor | 200 |
| `GET` | `/tasks` | Lista tareas paginadas | 200, 500 |
| `GET` | `/tasks/:id` | Obtiene una tarea por ID | 200, 404, 500 |
| `POST` | `/tasks` | Crea una nueva tarea | 201, 400, 422, 500 |
| `PUT` | `/tasks/:id` | Actualiza una tarea existente | 200, 400, 404, 422, 500 |
| `DELETE` | `/tasks/:id` | Elimina una tarea | 204, 404, 500 |

### GET /tasks — Paginación

Acepta query params para controlar la paginación:

| Param | Tipo | Default | Máximo | Descripción |
|-------|------|---------|--------|-------------|
| `page` | `number` | `1` | — | Número de página (1-indexed) |
| `limit` | `number` | `9` | `50` | Tareas por página |

**Respuesta exitosa:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Nombre de la tarea",
      "description": "Descripción opcional",
      "status": "pending",
      "createdAt": "2026-05-05T22:00:00.000Z",
      "updatedAt": "2026-05-05T22:00:00.000Z"
    }
  ],
  "total": 22,
  "page": 1,
  "limit": 9,
  "hasMore": true
}
```

### POST /tasks — Crear tarea

**Body (JSON):**

```json
{
  "title": "Nombre de la tarea",
  "description": "Descripción opcional",
  "status": "pending"
}
```

Reglas de validación:
- `title`: requerido, mínimo 3 caracteres, máximo 100.
- `description`: opcional, máximo 500 caracteres.
- `status`: `pending` | `in_progress` | `done`. Por defecto `pending`.

### PUT /tasks/:id — Actualizar tarea

**Body (JSON):** Todos los campos son opcionales.

```json
{
  "title": "Nuevo nombre",
  "description": "Nueva descripción",
  "status": "in_progress"
}
```

### Formato de Error

Todos los errores siguen la misma estructura:

```json
{
  "error": true,
  "status": 404,
  "message": "Task not found",
  "timestamp": "2026-05-05T22:00:00.000Z"
}
```

---

## Modelo de Datos

```typescript
type TaskStatus = "pending" | "in_progress" | "done";

type Task = {
  id:          string;     // UUID generado en el backend
  title:       string;     // Requerido, 3-100 caracteres
  description: string;     // Opcional, max 500 caracteres
  status:      TaskStatus; // Por defecto "pending"
  createdAt:   string;     // ISO 8601, asignado al crear
  updatedAt:   string;     // ISO 8601, actualizado en cada modificación
};
```

**Tabla SQLite:**

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
```

---

## Códigos de Estado HTTP

| Código | Uso |
|--------|-----|
| `200 OK` | GET y PUT exitosos |
| `201 Created` | POST exitoso — nueva tarea creada |
| `204 No Content` | DELETE exitoso — sin body de respuesta |
| `400 Bad Request` | JSON malformado en el body |
| `404 Not Found` | Tarea no encontrada por el ID proporcionado |
| `422 Unprocessable Entity` | Body válido pero que no cumple las reglas de validación |
| `500 Internal Server Error` | Error inesperado del servidor |

---

## Arquitectura

El proyecto aplica **Arquitectura Hexagonal (Ports & Adapters)**. El objetivo es mantener el núcleo de negocio (dominio y casos de uso) completamente independiente de frameworks, bases de datos y protocolos HTTP.

### Principio de Dependencias

```
adapters (HTTP)  →  application (casos de uso)  →  domain (entidades)
infrastructure   →  application / domain
domain           →  nada externo
```

La regla verificable: el directorio `src/domain/` no tiene ninguna importación de Express, SQLite, Zod ni ninguna librería externa.

### Las Cuatro Capas

**1. Domain** (`src/domain/`)
Contiene las reglas de negocio puras. No depende de ninguna librería externa.
- `Task` — entidad de dominio con métodos `create()`, `rehydrate()`, `rename()`, `changeStatus()`, `touch()`.
- `TaskRepository` — interfaz (puerto outbound) que define qué operaciones necesita la aplicación, sin indicar cómo se implementan.
- `TaskStatus` — value object que garantiza que solo se usen los tres estados válidos.

**2. Application** (`src/application/`)
Contiene los casos de uso. Orquesta el dominio usando los puertos, sin saber qué los implementa.
- `GetAllTasksUseCase` — obtiene tareas paginadas del repositorio.
- `GetTaskByIdUseCase` — obtiene una tarea por ID, lanza `AppError(404)` si no existe.
- `CreateTaskUseCase` — valida el DTO, crea la entidad `Task` y la persiste.
- `UpdateTaskUseCase` — busca la tarea, aplica los cambios en la entidad y persiste.
- `DeleteTaskUseCase` — elimina la tarea verificando existencia previa.
- `AppError` — error controlado que transporta el código HTTP hasta el middleware de errores.

**3. Infrastructure** (`src/infrastructure/`)
Implementa los puertos definidos en el dominio.
- `SQLiteTaskRepository` — implementa `TaskRepository` usando `better-sqlite3`. Traduce filas SQL a entidades de dominio y viceversa. Es el único lugar donde existe SQL en el proyecto.
- `sqlite.connection.ts` — crea y configura la conexión a la base de datos SQLite.

**4. Adapters** (`src/adapters/http/`)
Traducen entre el protocolo HTTP y los tipos de la aplicación.
- `TaskController` — recibe `req`/`res` de Express, extrae los datos, llama al caso de uso correspondiente y formatea la respuesta HTTP.
- `validate.middleware.ts` — valida el body con un Zod schema antes de que llegue al controller. Retorna `422` con los errores de campo si la validación falla.
- `error.middleware.ts` — captura todos los errores al final del stack. Distingue entre `AppError` (errores controlados) y errores inesperados (500).
- `task.routes.ts` — define las rutas Express y las conecta con los middlewares y el controller.

**5. Composition Root** (`src/composition/task.container.ts`)
Instancia los repositorios concretos y los inyecta en los casos de uso. Es el único lugar donde se conectan las capas.

```typescript
export function buildTaskContainer(db: Database) {
  const taskRepository = new SQLiteTaskRepository(db);
  return {
    getAllTasksUseCase:    new GetAllTasksUseCase(taskRepository),
    getTaskByIdUseCase:   new GetTaskByIdUseCase(taskRepository),
    createTaskUseCase:    new CreateTaskUseCase(taskRepository),
    updateTaskUseCase:    new UpdateTaskUseCase(taskRepository),
    deleteTaskUseCase:    new DeleteTaskUseCase(taskRepository),
  };
}
```

---

## Estructura de Carpetas

```
Task_periferia_back/
├── src/
│   ├── domain/                          # Núcleo de negocio — sin dependencias externas
│   │   ├── entities/
│   │   │   └── task.entity.ts           # Clase Task con factory methods y métodos de dominio
│   │   ├── value-objects/
│   │   │   └── task-status.vo.ts        # Guard de TypeScript para TaskStatus válido
│   │   └── repositories/
│   │       └── task.repository.ts       # Interfaz TaskRepository + tipo PagedResult<T>
│   │
│   ├── application/                     # Casos de uso — orquesta dominio sin conocer infraestructura
│   │   ├── dtos/
│   │   │   ├── create-task.dto.ts       # Tipo CreateTaskDTO
│   │   │   └── update-task.dto.ts       # Tipo UpdateTaskDTO
│   │   ├── errors/
│   │   │   └── app.error.ts             # AppError(message, statusCode) — error controlado
│   │   └── use-cases/
│   │       ├── get-all-tasks.use-case.ts    # Retorna PagedResult<TaskDTO>
│   │       ├── get-task-by-id.use-case.ts  # Lanza AppError(404) si no existe
│   │       ├── create-task.use-case.ts     # Genera id y createdAt en el dominio
│   │       ├── update-task.use-case.ts     # Aplica cambios parciales en la entidad
│   │       └── delete-task.use-case.ts     # Verifica existencia antes de eliminar
│   │
│   ├── infrastructure/                  # Implementaciones concretas — conoce SQLite
│   │   ├── database/
│   │   │   ├── sqlite.connection.ts     # Crea la instancia de better-sqlite3
│   │   │   └── migrations/
│   │   │       └── 001_create_tasks.sql # DDL de la tabla tasks
│   │   └── repositories/
│   │       └── sqlite-task.repository.ts # Implementa TaskRepository con SQL LIMIT/OFFSET
│   │
│   ├── adapters/                        # Frontera HTTP — traduce Request/Response a tipos de app
│   │   └── http/
│   │       ├── app.ts                   # Configura Express: cors, json, rutas, error middleware
│   │       ├── server.ts                # Punto de entrada: crea DB, container y arranca Express
│   │       ├── routes/
│   │       │   └── task.routes.ts       # Define las 6 rutas con sus middlewares
│   │       ├── controllers/
│   │       │   └── task.controller.ts   # Recibe req/res, delega al caso de uso
│   │       └── middlewares/
│   │           ├── error.middleware.ts  # Captura AppError y errores inesperados → JSON estandarizado
│   │           └── validate.middleware.ts # Valida body con Zod, retorna 422 si falla
│   │
│   └── composition/
│       └── task.container.ts            # Composition root: instancia repositorio y casos de uso
│
├── data/
│   └── tasks.db                         # Archivo SQLite (generado por db:migrate, no versionado)
├── .env                                 # Variables de entorno (no versionado)
├── .env.example                         # Plantilla de variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```
