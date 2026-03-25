const express = require('express');
const controller = require('../controllers/board.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateBoardCreate,
    validateColumnParams,
    validateCreateColumn,
    validateProjectIdParam,
    validateReorderColumns,
    validateUpdateColumn
} = require('../validators/board.validator');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/boards/project/{projectId}:
 *   get:
 *     summary: Obtener tableros de un proyecto
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tableros
 *   post:
 *     summary: Crear tablero en proyecto
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardCreateRequest'
 *     responses:
 *       201:
 *         description: Tablero creado
 */
router.get('/project/:projectId', validate({ params: validateProjectIdParam }), controller.getByProject);
router.post('/project/:projectId', validate({ params: validateProjectIdParam, body: validateBoardCreate }), controller.create);
/**
 * @swagger
 * /api/boards/{boardId}/columns:
 *   post:
 *     summary: Crear columna en un tablero
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardColumnRequest'
 *     responses:
 *       200:
 *         description: Columna creada
 */
router.post('/:boardId/columns', validate({ params: validateColumnParams, body: validateCreateColumn }), controller.createColumn);
/**
 * @swagger
 * /api/boards/{boardId}/columns/reorder:
 *   patch:
 *     summary: Reordenar columnas de un tablero
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReorderColumnsRequest'
 *     responses:
 *       200:
 *         description: Columnas reordenadas
 */
router.patch('/:boardId/columns/reorder', validate({ params: validateColumnParams, body: validateReorderColumns }), controller.reorder);
/**
 * @swagger
 * /api/boards/{boardId}/columns/{columnId}:
 *   patch:
 *     summary: Editar columna
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardColumnUpdateRequest'
 *     responses:
 *       200:
 *         description: Columna actualizada
 *   delete:
 *     summary: Eliminar columna vacia
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Columna eliminada
 */
router.patch('/:boardId/columns/:columnId', validate({ params: validateColumnParams, body: validateUpdateColumn }), controller.editColumn);
router.delete('/:boardId/columns/:columnId', validate({ params: validateColumnParams }), controller.removeColumn);

module.exports = router;