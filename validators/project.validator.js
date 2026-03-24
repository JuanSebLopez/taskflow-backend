const { PROJECT_STATUSES } = require('../utils/constants');
const { collectObjectId, collectRequiredString, isValidEmail } = require('./common.validator');

function validateProjectCreate(body) {
    const errors = [];
    const nameError = collectRequiredString(body, 'name', 'name');

    if (nameError) {
        errors.push(nameError);
    }

    return errors;
}

function validateProjectUpdate(body) {
    const errors = [];

    if (body.name !== undefined && collectRequiredString(body, 'name', 'name')) {
        errors.push('name cannot be empty');
    }

    if (body.status !== undefined && !PROJECT_STATUSES.includes(body.status)) {
        errors.push(`status must be one of: ${PROJECT_STATUSES.join(', ')}`);
    }

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
