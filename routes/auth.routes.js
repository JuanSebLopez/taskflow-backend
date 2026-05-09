const express = require('express');
const controller = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateLogin,
    validateProfileUpdate,
    validateRefreshToken,
    validateRegister,
    validateResendVerification,
    validateVerifyEmail
} = require('../validators/auth.validator');

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
 * /api/auth/verify-email:
 *   post:
 *     summary: Verificar correo del usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailRequest'
 *     responses:
 *       200:
 *         description: Correo verificado
 */
router.post('/verify-email', validate({ body: validateVerifyEmail }), controller.verifyEmail);
/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Reenviar correo de verificacion
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendVerificationRequest'
 *     responses:
 *       200:
 *         description: Correo reenviado
 */
router.post('/resend-verification', validate({ body: validateResendVerification }), controller.resendVerification);
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
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar sesion con refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Sesion renovada
 */
router.post('/refresh', validate({ body: validateRefreshToken }), controller.refresh);
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
 *   patch:
 *     summary: Actualizar perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.get('/me', protect, controller.me);
router.patch('/me', protect, validate({ body: validateProfileUpdate }), controller.updateMe);

module.exports = router;
