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
config/
controllers/
models/
routes/
server.js
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

## Endpoints base

- `GET /api/users`
- `POST /api/users`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/boards/:projectId`
- `POST /api/boards`

## Buenas practicas aplicadas o pendientes

- Uso de variables de entorno
- Separacion inicial por capas (`routes`, `controllers`, `models`)
- Pendiente fortalecer validaciones, middlewares, servicios y pruebas
- Pendiente dockerizacion y documentacion ampliada de API

## Estado del repositorio

Se limpio el seguimiento de `node_modules` y `.env`, y se agrego `.env.example` para evitar exponer credenciales reales.
