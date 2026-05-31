const express = require('express');
const controller = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    validateNotificationId,
    validateNotificationListQuery,
    validateProjectInvitationResponse
} = require('../validators/notification.validator');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Listar notificaciones del usuario autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 */
router.get('/', validate({ query: validateNotificationListQuery }), controller.list);
/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marcar todas las notificaciones como leidas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones marcadas como leidas
 */
router.patch('/read-all', controller.markAllRead);
/**
 * @swagger
 * /api/notifications/{id}/project-invitation:
 *   patch:
 *     summary: Aceptar o rechazar una invitacion a proyecto
 *     tags: [Notifications]
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
 *             type: object
 *             required: [response]
 *             properties:
 *               response:
 *                 type: string
 *                 enum: [ACCEPTED, DECLINED]
 *     responses:
 *       200:
 *         description: Invitacion respondida
 */
router.patch(
    '/:id/project-invitation',
    validate({ params: validateNotificationId, body: validateProjectInvitationResponse }),
    controller.respondProjectInvitation
);
/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marcar una notificacion como leida
 *     tags: [Notifications]
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
 *         description: Notificacion actualizada
 */
router.patch('/:id/read', validate({ params: validateNotificationId }), controller.markRead);

module.exports = router;
