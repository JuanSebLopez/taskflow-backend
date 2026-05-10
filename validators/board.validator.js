const {
    collectAllowedFields,
    collectObjectId,
    collectRequiredAtLeastOneField,
    collectRequiredString
} = require('./common.validator');

function validateProjectIdParam(params) {
    const error = collectObjectId(params, 'projectId', 'project id');
    return error ? [error] : [];
}

function validateBoardCreate(body) {
    const errors = [
        ...collectAllowedFields(body, ['name']),
        ...collectRequiredAtLeastOneField(body, ['name'], 'name is required')
    ];

    if (body.name !== undefined && collectRequiredString(body, 'name', 'name')) {
        errors.push('name cannot be empty');
    }

    return errors;
}

function validateCreateColumn(body) {
    const errors = [
        ...collectAllowedFields(body, ['title', 'wipLimit']),
        ...collectRequiredAtLeastOneField(body, ['title', 'wipLimit'], 'title is required')
    ];
    const titleError = collectRequiredString(body, 'title', 'title');

    if (titleError) {
        errors.push(titleError);
    }

    if (body.wipLimit !== undefined && (typeof body.wipLimit !== 'number' || body.wipLimit < 0)) {
        errors.push('wipLimit must be a number greater than or equal to 0');
    }

    return errors;
}

function validateUpdateColumn(body) {
    const errors = [
        ...collectAllowedFields(body, ['title', 'wipLimit', 'order']),
        ...collectRequiredAtLeastOneField(body, ['title', 'wipLimit', 'order'], 'At least one column field must be provided')
    ];

    if (body.title !== undefined && collectRequiredString(body, 'title', 'title')) {
        errors.push('title cannot be empty');
    }

    if (body.wipLimit !== undefined && (typeof body.wipLimit !== 'number' || body.wipLimit < 0)) {
        errors.push('wipLimit must be a number greater than or equal to 0');
    }

    if (body.order !== undefined && typeof body.order !== 'number') {
        errors.push('order must be a number');
    }

    return errors;
}

function validateColumnParams(params) {
    const errors = [];
    const boardError = collectObjectId(params, 'boardId', 'board id');
    const columnError = params.columnId ? collectObjectId(params, 'columnId', 'column id') : null;

    if (boardError) {
        errors.push(boardError);
    }

    if (columnError) {
        errors.push(columnError);
    }

    return errors;
}

function validateReorderColumns(body) {
    const errors = collectAllowedFields(body, ['columns']);

    if (!Array.isArray(body.columns) || body.columns.length === 0) {
        errors.push('columns must be a non-empty array');
        return errors;
    }

    body.columns.forEach((column, index) => {
        if (!column.columnId) {
            errors.push(`columns[${index}].columnId is required`);
        }

        if (typeof column.order !== 'number') {
            errors.push(`columns[${index}].order must be a number`);
        }
    });

    return errors;
}

module.exports = {
    validateProjectIdParam,
    validateBoardCreate,
    validateCreateColumn,
    validateUpdateColumn,
    validateColumnParams,
    validateReorderColumns
};
