const { TASK_PRIORITIES, TASK_TYPES } = require('../utils/constants');
const {
    collectAllowedFields,
    collectDateRange,
    collectObjectId,
    collectRequiredAtLeastOneField,
    collectRequiredString,
    collectValidDate,
    isPositiveNumber,
    isValidDateInput,
    isValidObjectId
} = require('./common.validator');

const TASK_CREATE_FIELDS = [
    'title',
    'description',
    'priority',
    'type',
    'dueDate',
    'estimatedHours',
    'project',
    'board',
    'columnId',
    'labels',
    'assignees',
    'subtasks'
];
const TASK_UPDATE_FIELDS = [
    'title',
    'description',
    'priority',
    'type',
    'dueDate',
    'estimatedHours',
    'labels',
    'assignees',
    'subtasks'
];

function validateTaskCreate(body) {
    const errors = collectAllowedFields(body, TASK_CREATE_FIELDS);
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

    const dueDateError = collectValidDate(body, 'dueDate', 'dueDate');
    if (dueDateError) {
        errors.push(dueDateError);
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
    const errors = [
        ...collectAllowedFields(body, TASK_UPDATE_FIELDS),
        ...collectRequiredAtLeastOneField(body, TASK_UPDATE_FIELDS, 'At least one task field must be provided')
    ];

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

    if (body.estimatedHours !== undefined && (!Number.isFinite(body.estimatedHours) || body.estimatedHours < 0)) {
        errors.push('estimatedHours must be a number greater than or equal to 0');
    }

    const dueDateError = collectValidDate(body, 'dueDate', 'dueDate');
    if (dueDateError) {
        errors.push(dueDateError);
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
    const errors = [
        ...collectAllowedFields(body, ['toColumnId']),
        ...collectRequiredAtLeastOneField(body, ['toColumnId'], 'toColumnId is required')
    ];
    const error = collectObjectId(body, 'toColumnId', 'toColumnId');
    if (error) {
        errors.push(error);
    }

    return errors;
}

function validateComment(body) {
    const errors = [
        ...collectAllowedFields(body, ['content']),
        ...collectRequiredAtLeastOneField(body, ['content'], 'content is required')
    ];
    const error = collectRequiredString(body, 'content', 'content');
    if (error) {
        errors.push(error);
    }

    return errors;
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
    const errors = [
        ...collectAllowedFields(body, ['hours', 'note']),
        ...collectRequiredAtLeastOneField(body, ['hours', 'note'], 'At least one time log field must be provided')
    ];

    if (!isPositiveNumber(body.hours)) {
        errors.push('hours must be a positive number');
    }

    if (body.note !== undefined && typeof body.note !== 'string') {
        errors.push('note must be a string');
    }

    return errors;
}

function validateAssignees(body) {
    const errors = [
        ...collectAllowedFields(body, ['assignees']),
        ...collectRequiredAtLeastOneField(body, ['assignees'], 'assignees is required')
    ];

    if (!Array.isArray(body.assignees)) {
        errors.push('assignees must be an array of user ids');
        return errors;
    }

    body.assignees.forEach((assigneeId, index) => {
        if (!isValidObjectId(assigneeId)) {
            errors.push(`assignees[${index}] must be a valid id`);
        }
    });

    return errors;
}

function validateSubtaskCreate(body) {
    const errors = collectAllowedFields(body, ['title', 'isCompleted']);
    const error = collectRequiredString(body, 'title', 'title');
    if (error) {
        errors.push(error);
    }

    if (body.isCompleted !== undefined && typeof body.isCompleted !== 'boolean') {
        errors.push('isCompleted must be a boolean');
    }

    return errors;
}

function validateSubtaskUpdate(body) {
    const errors = [
        ...collectAllowedFields(body, ['title', 'isCompleted']),
        ...collectRequiredAtLeastOneField(body, ['title', 'isCompleted'], 'At least one subtask field must be provided')
    ];

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

function validateTaskListQuery(query) {
    const errors = [];
    const allowedQueryFields = ['projectId', 'boardId', 'columnId', 'search', 'priority', 'type', 'assigneeId', 'labelName', 'dueDateFrom', 'dueDateTo', 'overdueOnly'];

    errors.push(...collectAllowedFields(query, allowedQueryFields, 'query'));

    const projectIdError = collectObjectId(query, 'projectId', 'projectId');
    if (projectIdError) {
        errors.push(projectIdError);
    }

    ['boardId', 'columnId', 'assigneeId'].forEach((field) => {
        if (query[field]) {
            const error = collectObjectId(query, field, field);
            if (error) {
                errors.push(error);
            }
        }
    });

    if (query.priority && !TASK_PRIORITIES.includes(query.priority)) {
        errors.push(`priority must be one of: ${TASK_PRIORITIES.join(', ')}`);
    }

    if (query.type && !TASK_TYPES.includes(query.type)) {
        errors.push(`type must be one of: ${TASK_TYPES.join(', ')}`);
    }

    ['dueDateFrom', 'dueDateTo'].forEach((field) => {
        if (query[field] && !isValidDateInput(query[field])) {
            errors.push(`${field} must be a valid ISO date`);
        }
    });

    const dateRangeError = collectDateRange(query.dueDateFrom, query.dueDateTo, 'dueDateFrom', 'dueDateTo');
    if (dateRangeError) {
        errors.push(dateRangeError);
    }

    if (query.overdueOnly !== undefined && !['true', 'false'].includes(String(query.overdueOnly))) {
        errors.push('overdueOnly must be true or false');
    }

    return errors;
}

module.exports = {
    validateTaskCreate,
    validateTaskListQuery,
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
