const { APP_THEMES } = require('../utils/constants');
const { isNonEmptyString, isValidEmail, collectRequiredString } = require('./common.validator');

function validateRegister(body) {
    const errors = [];
    const fullNameError = collectRequiredString(body, 'fullName', 'fullName');

    if (fullNameError) {
        errors.push(fullNameError);
    }

    if (!isValidEmail(body.email)) {
        errors.push('email must be valid');
    }

    if (!isNonEmptyString(body.password) || body.password.length < 6) {
        errors.push('password must be at least 6 characters');
    }

    return errors;
}

function validateLogin(body) {
    const errors = [];

    if (!isValidEmail(body.email)) {
        errors.push('email must be valid');
    }

    if (!isNonEmptyString(body.password)) {
        errors.push('password is required');
    }

    return errors;
}

function validateVerifyEmail(body) {
    const errors = [];

    if (!isValidEmail(body.email)) {
        errors.push('email must be valid');
    }

    if (!isNonEmptyString(body.token)) {
        errors.push('token is required');
    }

    return errors;
}

function validateResendVerification(body) {
    return isValidEmail(body.email) ? [] : ['email must be valid'];
}

function validateRefreshToken(body) {
    return isNonEmptyString(body.refreshToken) ? [] : ['refreshToken is required'];
}

function validateProfileUpdate(body) {
    const errors = [];

    if (body.fullName !== undefined && !isNonEmptyString(body.fullName)) {
        errors.push('fullName cannot be empty');
    }

    if (body.avatarUrl !== undefined && typeof body.avatarUrl !== 'string') {
        errors.push('avatarUrl must be a string');
    }

    if (body.bio !== undefined && typeof body.bio !== 'string') {
        errors.push('bio must be a string');
    }

    if (body.theme !== undefined && !APP_THEMES.includes(body.theme)) {
        errors.push(`theme must be one of: ${APP_THEMES.join(', ')}`);
    }

    if (body.notificationPreferences !== undefined) {
        const channels = ['inApp', 'email'];
        const keys = ['projectMemberAdded', 'projectArchived', 'taskAssigned', 'taskMoved', 'taskCommented'];

        if (typeof body.notificationPreferences !== 'object' || Array.isArray(body.notificationPreferences) || body.notificationPreferences === null) {
            errors.push('notificationPreferences must be an object');
        } else {
            channels.forEach((channel) => {
                const value = body.notificationPreferences[channel];

                if (value === undefined) {
                    return;
                }

                if (typeof value !== 'object' || Array.isArray(value) || value === null) {
                    errors.push(`notificationPreferences.${channel} must be an object`);
                    return;
                }

                keys.forEach((key) => {
                    if (value[key] !== undefined && typeof value[key] !== 'boolean') {
                        errors.push(`notificationPreferences.${channel}.${key} must be a boolean`);
                    }
                });
            });
        }
    }

    return errors;
}

module.exports = {
    validateRegister,
    validateLogin,
    validateVerifyEmail,
    validateResendVerification,
    validateRefreshToken,
    validateProfileUpdate
};
