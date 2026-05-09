const path = require('path');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/auth.routes');
const auditLogRoutes = require('./routes/audit-log.routes');
const boardRoutes = require('./routes/board.routes');
const notificationRoutes = require('./routes/notification.routes');
const projectRoutes = require('./routes/project.routes');
const taskFilterRoutes = require('./routes/task-filter.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificar salud del backend
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Backend operativo
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'taskflow-backend' });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/task-filters', taskFilterRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
