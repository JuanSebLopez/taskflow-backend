const { USER_ROLES } = require('../utils/constants');
const { collectAllowedFields, collectObjectId, collectRequiredAtLeastOneField } = require('./common.validator');

function validateUserId(params) {
    const error = collectObjectId(params, 'id', 'user id');
    return error ? [error] : [];
}

function validateUserRole(body) {
    const errors = [
        ...collectAllowedFields(body, ['role']),
        ...collectRequiredAtLeastOneField(body, ['role'], 'role is required')
    ];

    if (!body.role || !USER_ROLES.includes(body.role)) {
        errors.push(`role must be one of: ${USER_ROLES.join(', ')}`);
    }

    return errors;
}

function validateUserStatus(body) {
    const errors = [
        ...collectAllowedFields(body, ['isActive']),
        ...collectRequiredAtLeastOneField(body, ['isActive'], 'isActive is required')
    ];

    if (typeof body.isActive !== 'boolean') {
        errors.push('isActive must be a boolean');
    }

    return errors;
}

module.exports = {
    validateUserId,
    validateUserRole,
    validateUserStatus
};
