const { collectObjectId, collectRequiredString } = require('./common.validator');

function validateProjectIdParam(params) {
    const error = collectObjectId(params, 'projectId', 'project id');
    return error ? [error] : [];
}

function validateBoardCreate(body) {
    if (body.name !== undefined && collectRequiredString(body, 'name', 'name')) {
        return ['name cannot be empty'];
    }

    return [];
}

function validateCreateColumn(body) {
    const titleError = collectRequiredString(body, 'title', 'title');
    const errors = [];

    if (titleError) {
        errors.push(titleError);
    }

    if (body.wipLimit !== undefined && (typeof body.wipLimit !== 'number' || body.wipLimit < 0)) {
        errors.push('wipLimit must be a number greater than or equal to 0');
    }

    return errors;
}

function validateUpdateColumn(body) {
    const errors = [];

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
    if (!Array.isArray(body.columns) || body.columns.length === 0) {
        return ['columns must be a non-empty array'];
    }

    const errors = [];

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
