const { AUDIT_MODULES } = require('../utils/constants');
const { collectAllowedFields, collectObjectId } = require('./common.validator');

function validateAuditLogQuery(query) {
    const errors = collectAllowedFields(query, ['projectId', 'taskId', 'actorId', 'module', 'action'], 'query');

    if (query.projectId) {
        const error = collectObjectId(query, 'projectId', 'projectId');
        if (error) {
            errors.push(error);
        }
    }

    if (query.taskId) {
        const error = collectObjectId(query, 'taskId', 'taskId');
        if (error) {
            errors.push(error);
        }
    }

    if (query.actorId) {
        const error = collectObjectId(query, 'actorId', 'actorId');
        if (error) {
            errors.push(error);
        }
    }

    if (query.module && !AUDIT_MODULES.includes(query.module)) {
        errors.push(`module must be one of: ${AUDIT_MODULES.join(', ')}`);
    }

    if (query.action !== undefined && (typeof query.action !== 'string' || !query.action.trim())) {
        errors.push('action must be a non-empty string');
    }

    return errors;
}

module.exports = {
    validateAuditLogQuery
};
