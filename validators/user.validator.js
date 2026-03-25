const { USER_ROLES } = require('../utils/constants');
const { collectObjectId } = require('./common.validator');

function validateUserId(params) {
    const error = collectObjectId(params, 'id', 'user id');
    return error ? [error] : [];
}

function validateUserRole(body) {
    if (!body.role || !USER_ROLES.includes(body.role)) {
        return [`role must be one of: ${USER_ROLES.join(', ')}`];
    }

    return [];
}

function validateUserStatus(body) {
    if (typeof body.isActive !== 'boolean') {
        return ['isActive must be a boolean'];
    }

    return [];
}

module.exports = {
    validateUserId,
    validateUserRole,
    validateUserStatus
};