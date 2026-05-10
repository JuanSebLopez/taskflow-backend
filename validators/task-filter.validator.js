const { TASK_PRIORITIES, TASK_TYPES } = require('../utils/constants');
const {
    collectAllowedFields,
    collectDateRange,
    collectObjectId,
    collectRequiredString,
    isValidDateInput
} = require('./common.validator');

function validateTaskFilterCreate(body) {
    const errors = collectAllowedFields(body, ['name', 'projectId', 'criteria']);

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

    errors.push(...collectAllowedFields(body.criteria, ['boardId', 'columnId', 'assigneeId', 'priority', 'type', 'labelName', 'search', 'dueDateFrom', 'dueDateTo', 'overdueOnly'], 'criteria'));

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

    const dateRangeError = collectDateRange(body.criteria.dueDateFrom, body.criteria.dueDateTo, 'criteria.dueDateFrom', 'criteria.dueDateTo');
    if (dateRangeError) {
        errors.push(dateRangeError);
    }

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
    const errors = collectAllowedFields(query, ['projectId'], 'query');

    if (!query.projectId) {
        errors.push('projectId is required');
        return errors;
    }

    const error = collectObjectId(query, 'projectId', 'projectId');
    if (error) {
        errors.push(error);
    }

    return errors;
}

module.exports = {
    validateTaskFilterCreate,
    validateTaskFilterId,
    validateTaskFilterListQuery
};
