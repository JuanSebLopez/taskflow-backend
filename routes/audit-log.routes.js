const express = require('express');
const controller = require('../controllers/audit-log.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateAuditLogQuery } = require('../validators/audit-log.validator');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Listar auditoria del sistema, proyecto o tarea
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: actorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de eventos de auditoria
 */
router.get('/', validate({ query: validateAuditLogQuery }), controller.list);

module.exports = router;
