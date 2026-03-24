const express = require('express');
const controller = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateLogin, validateProfileUpdate, validateRegister } = require('../validators/auth.validator');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 */
router.post('/register', validate({ body: validateRegister }), controller.register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesion
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login correcto
 */
router.post('/login', validate({ body: validateLogin }), controller.login);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesion
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout correcto
 */
router.post('/logout', protect, controller.logout);
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario autenticado
 */
router.get('/me', protect, controller.me);
/**
 * @swagger
 * /api/auth/me:
 *   patch:
 *     summary: Actualizar perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.patch('/me', protect, validate({ body: validateProfileUpdate }), controller.updateMe);

module.exports = router;
