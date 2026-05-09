const express = require('express');
const controller = require('../controllers/system-setting.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateSystemSettingUpdate, validateSystemTestEmail } = require('../validators/system-setting.validator');

const router = express.Router();

/**
 * @swagger
 * /api/system-settings/public:
 *   get:
 *     summary: Obtener configuracion publica del sistema
 *     tags: [System Settings]
 *     responses:
 *       200:
 *         description: Configuracion publica
 */
router.get('/public', controller.getPublic);

router.use(protect, restrictTo('ADMIN'));

/**
 * @swagger
 * /api/system-settings:
 *   get:
 *     summary: Obtener configuracion completa del sistema
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuracion completa
 *   patch:
 *     summary: Actualizar configuracion del sistema
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SystemSettingUpdateRequest'
 *     responses:
 *       200:
 *         description: Configuracion actualizada
 */
router.get('/', controller.getAdmin);
router.patch('/', validate({ body: validateSystemSettingUpdate }), controller.update);
/**
 * @swagger
 * /api/system-settings/test-email:
 *   post:
 *     summary: Enviar correo de prueba usando la configuracion SMTP
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SystemTestEmailRequest'
 *     responses:
 *       200:
 *         description: Correo enviado
 */
router.post('/test-email', validate({ body: validateSystemTestEmail }), controller.sendEmailTest);

module.exports = router;
