const { TASK_PRIORITIES, TASK_TYPES } = require('../utils/constants');
const { collectObjectId, collectRequiredString, isPositiveNumber } = require('./common.validator');

function validateTaskCreate(body) {
    const errors = [];
    const titleError = collectRequiredString(body, 'title', 'title');

    if (titleError) {
        errors.push(titleError);
    }

    ['project', 'board', 'columnId'].forEach((field) => {
        const error = collectObjectId(body, field, field);
        if (error) {
            errors.push(error);
        }
    });

    if (body.type !== undefined && !TASK_TYPES.includes(body.type)) {
        errors.push(`type must be one of: ${TASK_TYPES.join(', ')}`);
    }

    if (body.priority !== undefined && !TASK_PRIORITIES.includes(body.priority)) {
        errors.push(`priority must be one of: ${TASK_PRIORITIES.join(', ')}`);
    }

    if (body.estimatedHours !== undefined && (!Number.isFinite(body.estimatedHours) || body.estimatedHours < 0)) {
        errors.push('estimatedHours must be a number greater than or equal to 0');
    }

    return errors;
}

function validateTaskUpdate(body) {
    const errors = [];

    if (body.title !== undefined && collectRequiredString(body, 'title', 'title')) {
        errors.push('title cannot be empty');
    }

    if (body.type !== undefined && !TASK_TYPES.includes(body.type)) {
        errors.push(`type must be one of: ${TASK_TYPES.join(', ')}`);
    }

    if (body.priority !== undefined && !TASK_PRIORITIES.includes(body.priority)) {
        errors.push(`priority must be one of: ${TASK_PRIORITIES.join(', ')}`);
    }

    return errors;
}

function validateTaskId(params) {
    const error = collectObjectId(params, 'id', 'task id');
    return error ? [error] : [];
}

function validateMoveTask(body) {
    const error = collectObjectId(body, 'toColumnId', 'toColumnId');
    return error ? [error] : [];
}

function validateComment(body) {
    const error = collectRequiredString(body, 'content', 'content');
    return error ? [error] : [];
}

function validateCommentParams(params) {
    const errors = [];
    const taskIdError = collectObjectId(params, 'id', 'task id');
    const commentIdError = params.commentId ? collectObjectId(params, 'commentId', 'comment id') : null;

    if (taskIdError) {
        errors.push(taskIdError);
    }

    if (commentIdError) {
        errors.push(commentIdError);
    }

    return errors;
}

function validateTimeLog(body) {
    if (!isPositiveNumber(body.hours)) {
        return ['hours must be a positive number'];
    }

    if (body.note !== undefined && typeof body.note !== 'string') {
        return ['note must be a string'];
    }

    return [];
}

module.exports = {
    validateTaskCreate,
    validateTaskUpdate,
    validateTaskId,
    validateMoveTask,
    validateComment,
    validateCommentParams,
    validateTimeLog
};
