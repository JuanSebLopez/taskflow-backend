const express = require('express');
const controller = require('../controllers/task-filter.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateTaskFilterCreate,
    validateTaskFilterId,
    validateTaskFilterListQuery
} = require('../validators/task-filter.validator');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/task-filters:
 *   get:
 *     summary: Listar filtros guardados del usuario para un proyecto
 *     tags: [Task Filters]
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
 *         description: Lista de filtros guardados
 *   post:
 *     summary: Guardar un filtro personalizado de tareas
 *     tags: [Task Filters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SavedTaskFilterRequest'
 *     responses:
 *       201:
 *         description: Filtro guardado
 */
router.get('/', validate({ query: validateTaskFilterListQuery }), controller.list);
router.post('/', validate({ body: validateTaskFilterCreate }), controller.create);
/**
 * @swagger
 * /api/task-filters/{id}:
 *   delete:
 *     summary: Eliminar un filtro guardado
 *     tags: [Task Filters]
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
 *         description: Filtro eliminado
 */
router.delete('/:id', validate({ params: validateTaskFilterId }), controller.remove);

module.exports = router;
