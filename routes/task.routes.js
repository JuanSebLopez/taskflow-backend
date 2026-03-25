const express = require('express');
const controller = require('../controllers/task.controller');
const { protect } = require('../middlewares/auth.middleware');
const { handleUploadErrors, upload } = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateAssignees,
    validateAttachmentParams,
    validateComment,
    validateCommentParams,
    validateMoveTask,
    validateSubtaskCreate,
    validateSubtaskParams,
    validateSubtaskUpdate,
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
 *       - in: query
 *         name: boardId
 *         schema:
 *           type: string
 *       - in: query
 *         name: columnId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
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
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtener tarea por id
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarea encontrada
 */
router.get('/:id', validate({ params: validateTaskId }), controller.getById);
/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Actualizar tarea
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
 *             $ref: '#/components/schemas/TaskUpdateRequest'
 *     responses:
 *       200:
 *         description: Tarea actualizada
 */
router.patch('/:id', validate({ params: validateTaskId, body: validateTaskUpdate }), controller.update);
/**
 * @swagger
 * /api/tasks/{id}/assignees:
 *   patch:
 *     summary: Asignar responsables a una tarea
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
 *             $ref: '#/components/schemas/AssignTaskRequest'
 *     responses:
 *       200:
 *         description: Responsables actualizados
 */
router.patch('/:id/assignees', validate({ params: validateTaskId, body: validateAssignees }), controller.assign);
/**
 * @swagger
 * /api/tasks/{id}/subtasks:
 *   post:
 *     summary: Crear subtarea
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
 *             $ref: '#/components/schemas/SubtaskCreateRequest'
 *     responses:
 *       200:
 *         description: Subtarea creada
 */
router.post('/:id/subtasks', validate({ params: validateTaskId, body: validateSubtaskCreate }), controller.addSubtask);
/**
 * @swagger
 * /api/tasks/{id}/subtasks/{subtaskId}:
 *   patch:
 *     summary: Editar subtarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubtaskUpdateRequest'
 *     responses:
 *       200:
 *         description: Subtarea actualizada
 *   delete:
 *     summary: Eliminar subtarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subtarea eliminada
 */
router.patch('/:id/subtasks/:subtaskId', validate({ params: validateSubtaskParams, body: validateSubtaskUpdate }), controller.updateSubtask);
router.delete('/:id/subtasks/:subtaskId', validate({ params: validateSubtaskParams }), controller.removeSubtask);
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
router.post('/:id/move', validate({ params: validateTaskId, body: validateMoveTask }), controller.move);
/**
 * @swagger
 * /api/tasks/{id}/clone:
 *   post:
 *     summary: Clonar una tarea como plantilla
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Tarea clonada
 */
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
/**
 * @swagger
 * /api/tasks/{id}/comments/{commentId}:
 *   patch:
 *     summary: Editar comentario propio
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
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
 *         description: Comentario actualizado
 *   delete:
 *     summary: Eliminar comentario propio
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comentario eliminado
 */
router.patch('/:id/comments/:commentId', validate({ params: validateCommentParams, body: validateComment }), controller.editComment);
router.delete('/:id/comments/:commentId', validate({ params: validateCommentParams }), controller.removeComment);
/**
 * @swagger
 * /api/tasks/{id}/attachments:
 *   post:
 *     summary: Adjuntar archivos a una tarea
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Archivos adjuntados
 */
router.post('/:id/attachments', validate({ params: validateTaskId }), upload.array('files', 5), handleUploadErrors, controller.uploadAttachments);
/**
 * @swagger
 * /api/tasks/{id}/attachments/{attachmentId}:
 *   delete:
 *     summary: Eliminar adjunto de una tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Adjunto eliminado
 */
router.delete('/:id/attachments/:attachmentId', validate({ params: validateAttachmentParams }), controller.removeAttachment);
/**
 * @swagger
 * /api/tasks/{id}/time-logs:
 *   post:
 *     summary: Registrar tiempo invertido en una tarea
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
 *             $ref: '#/components/schemas/TimeLogRequest'
 *     responses:
 *       200:
 *         description: Tiempo registrado
 */
router.post('/:id/time-logs', validate({ params: validateTaskId, body: validateTimeLog }), controller.timeLog);

module.exports = router;