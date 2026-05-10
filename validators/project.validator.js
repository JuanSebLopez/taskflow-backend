const { PROJECT_STATUSES } = require('../utils/constants');
const {
    collectAllowedFields,
    collectDateRange,
    collectObjectId,
    collectRequiredAtLeastOneField,
    collectRequiredString,
    collectValidDate,
    isValidEmail
} = require('./common.validator');

const PROJECT_CREATE_FIELDS = ['name', 'description', 'startDate', 'estimatedEndDate'];
const PROJECT_UPDATE_FIELDS = ['name', 'description', 'startDate', 'estimatedEndDate', 'status'];

function validateProjectCreate(body) {
    const errors = collectAllowedFields(body, PROJECT_CREATE_FIELDS);
    const nameError = collectRequiredString(body, 'name', 'name');

    if (nameError) {
        errors.push(nameError);
    }

    const startDateError = collectValidDate(body, 'startDate', 'startDate');
    const estimatedEndDateError = collectValidDate(body, 'estimatedEndDate', 'estimatedEndDate');
    const dateRangeError = collectDateRange(body.startDate, body.estimatedEndDate, 'startDate', 'estimatedEndDate');

    [startDateError, estimatedEndDateError, dateRangeError].filter(Boolean).forEach((error) => errors.push(error));

    return errors;
}

function validateProjectUpdate(body) {
    const errors = [
        ...collectAllowedFields(body, PROJECT_UPDATE_FIELDS),
        ...collectRequiredAtLeastOneField(body, PROJECT_UPDATE_FIELDS, 'At least one project field must be provided')
    ];

    if (body.name !== undefined && collectRequiredString(body, 'name', 'name')) {
        errors.push('name cannot be empty');
    }

    if (body.status !== undefined && !PROJECT_STATUSES.includes(body.status)) {
        errors.push(`status must be one of: ${PROJECT_STATUSES.join(', ')}`);
    }

    const startDateError = collectValidDate(body, 'startDate', 'startDate');
    const estimatedEndDateError = collectValidDate(body, 'estimatedEndDate', 'estimatedEndDate');
    const dateRangeError = collectDateRange(body.startDate, body.estimatedEndDate, 'startDate', 'estimatedEndDate');

    [startDateError, estimatedEndDateError, dateRangeError].filter(Boolean).forEach((error) => errors.push(error));

    return errors;
}

function validateProjectId(params) {
    const error = collectObjectId(params, 'id', 'project id');
    return error ? [error] : [];
}

function validateProjectMember(body) {
    return isValidEmail(body.email) ? [] : ['email must be valid'];
}

module.exports = {
    validateProjectCreate,
    validateProjectUpdate,
    validateProjectId,
    validateProjectMember
};
