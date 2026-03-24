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
 */
router.get('/project/:projectId', validate({ params: validateProjectIdParam }), controller.getByProject);
/**
 * @swagger
 * /api/boards/project/{projectId}:
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
 *     responses:
 *       201:
 *         description: Tablero creado
 */
router.post('/project/:projectId', validate({ params: validateProjectIdParam, body: validateBoardCreate }), controller.create);
router.post('/:boardId/columns', validate({ params: validateColumnParams, body: validateCreateColumn }), controller.createColumn);
router.patch('/:boardId/columns/reorder', validate({ params: validateColumnParams, body: validateReorderColumns }), controller.reorder);
router.patch('/:boardId/columns/:columnId', validate({ params: validateColumnParams, body: validateUpdateColumn }), controller.editColumn);
router.delete('/:boardId/columns/:columnId', validate({ params: validateColumnParams }), controller.removeColumn);

module.exports = router;
