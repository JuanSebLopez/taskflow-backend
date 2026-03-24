const express = require('express');
const controller = require('../controllers/task.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateComment,
    validateCommentParams,
    validateMoveTask,
    validateTaskCreate,
    validateTaskId,
    validateTaskUpdate,
    validateTimeLog
} = require('../validators/task.validator');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Listar tareas por proyecto
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tareas
 */
router.get('/', controller.list);
/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crear tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskRequest'
 *     responses:
 *       201:
 *         description: Tarea creada
 */
router.post('/', validate({ body: validateTaskCreate }), controller.create);
/**
 * @swagger
 * /api/tasks/{id}/move:
 *   post:
 *     summary: Mover tarea entre columnas
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoveTaskRequest'
 *     responses:
 *       200:
 *         description: Tarea movida
 */
router.get('/:id', validate({ params: validateTaskId }), controller.getById);
router.patch('/:id', validate({ params: validateTaskId, body: validateTaskUpdate }), controller.update);
router.post('/:id/move', validate({ params: validateTaskId, body: validateMoveTask }), controller.move);
router.post('/:id/clone', validate({ params: validateTaskId }), controller.clone);
/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   post:
 *     summary: Agregar comentario a una tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentRequest'
 *     responses:
 *       200:
 *         description: Comentario agregado
 */
router.post('/:id/comments', validate({ params: validateTaskId, body: validateComment }), controller.comment);
router.patch('/:id/comments/:commentId', validate({ params: validateCommentParams, body: validateComment }), controller.editComment);
router.delete('/:id/comments/:commentId', validate({ params: validateCommentParams }), controller.removeComment);
router.post('/:id/time-logs', validate({ params: validateTaskId, body: validateTimeLog }), controller.timeLog);

module.exports = router;
