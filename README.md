# TaskFlow Backend

Backend de TaskFlow desarrollado con Node.js, Express y MongoDB para la gestion de usuarios, proyectos, tableros y tareas.

## Descripcion

Este proyecto hace parte del caso de estudio TaskFlow para la asignatura de Patrones de Diseno de Software. La aplicacion implementa funcionalidades base de gestion de tareas y sirve como soporte para aplicar patrones creacionales y buenas practicas de desarrollo.

## Funcionalidades base

- Gestion de usuarios
- Gestion de proyectos
- Gestion de tableros
- Gestion de tareas

## Tecnologias

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- dotenv
- JSON Web Token

## Patrones de diseno considerados

- `Singleton`: conexion a la base de datos
- `Factory Method`: creacion de tareas segun su tipo
- `Prototype`: clonado de tareas y proyectos
- `Builder`: creacion avanzada de tareas

## Estructura actual

```text
app.js
builders/
config/
controllers/
factories/
middlewares/
models/
routes/
services/
server.js
utils/
```

## Requisitos

- Node.js 20 o superior
- npm
- MongoDB Atlas o una instancia de MongoDB disponible

## Variables de entorno

Crear un archivo `.env` tomando como base `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>/<database>
JWT_SECRET=change_this_secret
```

## Instalacion

```bash
npm install
```

## Ejecucion

Modo normal:

```bash
node server.js
```

Modo desarrollo:

```bash
npx nodemon server.js
```

## MVP implementado

- Registro y login con JWT
- Perfil de usuario y logout
- Roles base: `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`
- Creacion de proyectos con tablero Kanban por defecto
- Invitacion de miembros por correo
- Archivado y clonado de proyectos
- Gestion de tableros y columnas con limite WIP
- Creacion, edicion, movimiento y clonado de tareas
- Historial basico de tareas
- Comentarios y registro de tiempo en tareas

## Endpoints base

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/me`

Users:
- `GET /api/users`
- `PATCH /api/users/:id/deactivate`

Projects:
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`
- `POST /api/projects/:id/archive`
- `POST /api/projects/:id/clone`

Boards:
- `GET /api/boards/project/:projectId`
- `POST /api/boards/project/:projectId`
- `POST /api/boards/:boardId/columns`
- `PATCH /api/boards/:boardId/columns/reorder`
- `PATCH /api/boards/:boardId/columns/:columnId`
- `DELETE /api/boards/:boardId/columns/:columnId`

Tasks:
- `GET /api/tasks?projectId=<id>`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `POST /api/tasks/:id/move`
- `POST /api/tasks/:id/clone`
- `POST /api/tasks/:id/comments`
- `PATCH /api/tasks/:id/comments/:commentId`
- `DELETE /api/tasks/:id/comments/:commentId`
- `POST /api/tasks/:id/time-logs`

## Buenas practicas aplicadas o pendientes

- Uso de variables de entorno
- Separacion por capas: `routes`, `controllers`, `services`, `models`
- Manejo centralizado de errores y middleware de autenticacion
- Patrones visibles para la entrega: `Singleton`, `Factory Method`, `Prototype`, `Builder`
- Pendiente fortalecer validaciones request por request
- Pendiente adjuntos de archivos, notificaciones, reportes y dockerizacion

## Estado del repositorio

Se limpio el seguimiento de `node_modules` y `.env`, y se agrego `.env.example` para evitar exponer credenciales reales.
