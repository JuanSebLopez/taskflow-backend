const { TASK_PRIORITIES, TASK_TYPES } = require('../utils/constants');
const { collectObjectId, collectRequiredString } = require('./common.validator');

function isValidDateInput(value) {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function validateTaskFilterCreate(body) {
    const errors = [];

    const nameError = collectRequiredString(body, 'name', 'name');
    if (nameError) {
        errors.push(nameError);
    }

    const projectError = collectObjectId(body, 'projectId', 'projectId');
    if (projectError) {
        errors.push(projectError);
    }

    if (body.criteria === undefined || typeof body.criteria !== 'object' || body.criteria === null || Array.isArray(body.criteria)) {
        errors.push('criteria must be an object');
        return errors;
    }

    ['boardId', 'columnId', 'assigneeId'].forEach((field) => {
        if (body.criteria[field]) {
            const error = collectObjectId(body.criteria, field, `criteria.${field}`);
            if (error) {
                errors.push(error);
            }
        }
    });

    if (body.criteria.priority && !TASK_PRIORITIES.includes(body.criteria.priority)) {
        errors.push(`criteria.priority must be one of: ${TASK_PRIORITIES.join(', ')}`);
    }

    if (body.criteria.type && !TASK_TYPES.includes(body.criteria.type)) {
        errors.push(`criteria.type must be one of: ${TASK_TYPES.join(', ')}`);
    }

    ['dueDateFrom', 'dueDateTo'].forEach((field) => {
        if (body.criteria[field] && !isValidDateInput(body.criteria[field])) {
            errors.push(`criteria.${field} must be a valid ISO date`);
        }
    });

    if (body.criteria.overdueOnly !== undefined && typeof body.criteria.overdueOnly !== 'boolean') {
        errors.push('criteria.overdueOnly must be a boolean');
    }

    return errors;
}

function validateTaskFilterId(params) {
    const error = collectObjectId(params, 'id', 'filter id');
    return error ? [error] : [];
}

function validateTaskFilterListQuery(query) {
    if (!query.projectId) {
        return ['projectId is required'];
    }

    const error = collectObjectId(query, 'projectId', 'projectId');
    return error ? [error] : [];
}

module.exports = {
    validateTaskFilterCreate,
    validateTaskFilterId,
    validateTaskFilterListQuery
};
