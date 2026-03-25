const { TASK_PRIORITIES, TASK_TYPES } = require('../utils/constants');
const { collectObjectId, collectRequiredString, isPositiveNumber, isValidObjectId } = require('./common.validator');

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

    if (body.assignees !== undefined && !Array.isArray(body.assignees)) {
        errors.push('assignees must be an array of user ids');
    }

    if (Array.isArray(body.assignees)) {
        body.assignees.forEach((assigneeId, index) => {
            if (!isValidObjectId(assigneeId)) {
                errors.push(`assignees[${index}] must be a valid id`);
            }
        });
    }

    if (body.subtasks !== undefined && !Array.isArray(body.subtasks)) {
        errors.push('subtasks must be an array');
    }

    if (Array.isArray(body.subtasks)) {
        body.subtasks.forEach((subtask, index) => {
            if (!subtask || typeof subtask.title !== 'string' || !subtask.title.trim()) {
                errors.push(`subtasks[${index}].title is required`);
            }
        });
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

    if (body.assignees !== undefined && !Array.isArray(body.assignees)) {
        errors.push('assignees must be an array of user ids');
    }

    if (Array.isArray(body.assignees)) {
        body.assignees.forEach((assigneeId, index) => {
            if (!isValidObjectId(assigneeId)) {
                errors.push(`assignees[${index}] must be a valid id`);
            }
        });
    }

    if (body.subtasks !== undefined && !Array.isArray(body.subtasks)) {
        errors.push('subtasks must be an array');
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

function validateAssignees(body) {
    if (!Array.isArray(body.assignees)) {
        return ['assignees must be an array of user ids'];
    }

    const errors = [];

    body.assignees.forEach((assigneeId, index) => {
        if (!isValidObjectId(assigneeId)) {
            errors.push(`assignees[${index}] must be a valid id`);
        }
    });

    return errors;
}

function validateSubtaskCreate(body) {
    const error = collectRequiredString(body, 'title', 'title');
    return error ? [error] : [];
}

function validateSubtaskUpdate(body) {
    const errors = [];

    if (body.title !== undefined && collectRequiredString(body, 'title', 'title')) {
        errors.push('title cannot be empty');
    }

    if (body.isCompleted !== undefined && typeof body.isCompleted !== 'boolean') {
        errors.push('isCompleted must be a boolean');
    }

    return errors;
}

function validateSubtaskParams(params) {
    const errors = validateTaskId(params);
    const subtaskIdError = params.subtaskId ? collectObjectId(params, 'subtaskId', 'subtask id') : null;

    if (subtaskIdError) {
        errors.push(subtaskIdError);
    }

    return errors;
}

function validateAttachmentParams(params) {
    const errors = validateTaskId(params);
    const attachmentIdError = params.attachmentId ? collectObjectId(params, 'attachmentId', 'attachment id') : null;

    if (attachmentIdError) {
        errors.push(attachmentIdError);
    }

    return errors;
}

module.exports = {
    validateTaskCreate,
    validateTaskUpdate,
    validateTaskId,
    validateMoveTask,
    validateComment,
    validateCommentParams,
    validateTimeLog,
    validateAssignees,
    validateSubtaskCreate,
    validateSubtaskUpdate,
    validateSubtaskParams,
    validateAttachmentParams
};