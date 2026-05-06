# Task Manager API

API REST para gestionar tareas, construida con Node.js, Express, TypeScript y SQLite siguiendo arquitectura hexagonal.

## Stack

- Node.js
- Express
- TypeScript
- SQLite con `better-sqlite3`
- Zod
- Arquitectura hexagonal

## Instalación

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Servidor por defecto:

```text
http://localhost:3000
```

## Variables de entorno

```text
PORT=3000
DB_PATH=./data/tasks.db
ALLOWED_ORIGINS=http://localhost:4200
```

## Scripts

```bash
npm run build
npm run lint
npm run db:migrate
npm run dev
npm start
```

## Endpoints

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/tasks` | Lista todas las tareas |
| `GET` | `/tasks/:id` | Obtiene una tarea por id |
| `POST` | `/tasks` | Crea una tarea |
| `PUT` | `/tasks/:id` | Actualiza una tarea |
| `DELETE` | `/tasks/:id` | Elimina una tarea |

## Payloads

Crear tarea:

```json
{
  "title": "Definir arquitectura",
  "description": "Cerrar decisiones de diseño",
  "status": "pending"
}
```

Actualizar tarea:

```json
{
  "status": "done"
}
```

Estados válidos:

```text
pending
in_progress
done
```

## Errores

Formato de error:

```json
{
  "error": true,
  "status": 404,
  "message": "Task not found",
  "timestamp": "2026-05-05T22:00:00.000Z"
}
```

## Arquitectura

```text
src/
  domain/
    entities/
    value-objects/
    repositories/
  application/
    dtos/
    errors/
    use-cases/
  infrastructure/
    database/
    repositories/
  adapters/
    http/
  composition/
```

Reglas aplicadas:

- El dominio no depende de Express, SQLite ni Zod.
- Los casos de uso dependen de puertos.
- SQLite está detrás de `TaskRepository`.
- Los controllers son adaptadores HTTP.
- `composition/task.container.ts` centraliza el wiring.

## Verificación

```bash
npm run build
npm run lint
npm run db:migrate
```

