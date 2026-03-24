const express = require('express');
const controller = require('../controllers/project.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateProjectCreate,
    validateProjectId,
    validateProjectMember,
    validateProjectUpdate
} = require('../validators/project.validator');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Listar proyectos del usuario
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
router.get('/', controller.list);
/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Crear proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectRequest'
 *     responses:
 *       201:
 *         description: Proyecto creado
 */
router.post('/', validate({ body: validateProjectCreate }), controller.create);
/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Obtener un proyecto por id
 *     tags: [Projects]
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
 *         description: Proyecto encontrado
 */
router.get('/:id', validate({ params: validateProjectId }), controller.getById);
/**
 * @swagger
 * /api/projects/{id}:
 *   patch:
 *     summary: Actualizar proyecto
 *     tags: [Projects]
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
 *         description: Proyecto actualizado
 */
router.patch('/:id', validate({ params: validateProjectId, body: validateProjectUpdate }), controller.update);
/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Agregar miembro por correo
 *     tags: [Projects]
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
 *         description: Miembro agregado
 */
router.delete('/:id', validate({ params: validateProjectId }), controller.remove);
router.post('/:id/members', validate({ params: validateProjectId, body: validateProjectMember }), controller.addMember);
router.post('/:id/archive', validate({ params: validateProjectId }), controller.archive);
router.post('/:id/clone', validate({ params: validateProjectId }), controller.clone);

module.exports = router;
