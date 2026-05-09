const { AUDIT_MODULES } = require('../utils/constants');
const { collectObjectId } = require('./common.validator');

function validateAuditLogQuery(query) {
    const errors = [];

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

    return errors;
}

module.exports = {
    validateAuditLogQuery
};
