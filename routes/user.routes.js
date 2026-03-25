const express = require('express');
const controller = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateUserId, validateUserRole, validateUserStatus } = require('../validators/user.validator');

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuarios del sistema
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/', controller.listUsers);
/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Actualizar rol global de un usuario
 *     tags: [Users]
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
 *             $ref: '#/components/schemas/UserRoleRequest'
 *     responses:
 *       200:
 *         description: Rol actualizado
 */
router.patch('/:id/role', validate({ params: validateUserId, body: validateUserRole }), controller.updateRole);
/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Activar o desactivar un usuario
 *     tags: [Users]
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
 *             $ref: '#/components/schemas/UserStatusRequest'
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:id/status', validate({ params: validateUserId, body: validateUserStatus }), controller.updateStatus);
/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Desactivar un usuario
 *     tags: [Users]
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
 *         description: Usuario desactivado
 */
router.patch('/:id/deactivate', validate({ params: validateUserId }), controller.deactivate);

module.exports = router;