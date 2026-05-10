const { APP_THEMES } = require('../utils/constants');
const { collectAllowedFields, collectRequiredAtLeastOneField, isPlainObject } = require('./common.validator');

function validateSystemSettingUpdate(body) {
    const allowedRootFields = ['platformName', 'defaultTheme', 'availableThemes', 'maxAttachmentSizeMb', 'passwordPolicy'];
    const errors = [
        ...collectAllowedFields(body, allowedRootFields),
        ...collectRequiredAtLeastOneField(body, allowedRootFields, 'At least one system setting field must be provided')
    ];

    if (body.platformName !== undefined && (typeof body.platformName !== 'string' || !body.platformName.trim())) {
        errors.push('platformName must be a non-empty string');
    }

    if (body.defaultTheme !== undefined && !APP_THEMES.includes(body.defaultTheme)) {
        errors.push(`defaultTheme must be one of: ${APP_THEMES.join(', ')}`);
    }

    if (body.availableThemes !== undefined) {
        if (!Array.isArray(body.availableThemes) || body.availableThemes.length === 0) {
            errors.push('availableThemes must be a non-empty array');
        } else {
            body.availableThemes.forEach((theme, index) => {
                if (!APP_THEMES.includes(theme)) {
                    errors.push(`availableThemes[${index}] must be one of: ${APP_THEMES.join(', ')}`);
                }
            });
        }
    }

    if (body.maxAttachmentSizeMb !== undefined && (!Number.isFinite(body.maxAttachmentSizeMb) || body.maxAttachmentSizeMb < 1)) {
        errors.push('maxAttachmentSizeMb must be a number greater than or equal to 1');
    }

    if (body.passwordPolicy !== undefined) {
        const policy = body.passwordPolicy;

        if (typeof policy !== 'object' || policy === null || Array.isArray(policy)) {
            errors.push('passwordPolicy must be an object');
        } else {
            Object.keys(policy).forEach((field) => {
                if (!['minLength', 'requireUppercase', 'requireNumber', 'requireSpecialChar'].includes(field)) {
                    errors.push(`passwordPolicy.${field} is not allowed`);
                }
            });

            if (policy.minLength !== undefined && (!Number.isInteger(policy.minLength) || policy.minLength < 6)) {
                errors.push('passwordPolicy.minLength must be an integer greater than or equal to 6');
            }

            ['requireUppercase', 'requireNumber', 'requireSpecialChar'].forEach((field) => {
                if (policy[field] !== undefined && typeof policy[field] !== 'boolean') {
                    errors.push(`passwordPolicy.${field} must be a boolean`);
                }
            });
        }
    }

    return errors;
}

function validateSystemTestEmail(body) {
    if (!isPlainObject(body)) {
        return ['body must be an object'];
    }

    const errors = collectAllowedFields(body, ['email', 'fullName']);

    if (body.email !== undefined && (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))) {
        errors.push('email must be valid');
    }

    if (body.fullName !== undefined && (typeof body.fullName !== 'string' || !body.fullName.trim())) {
        errors.push('fullName must be a non-empty string');
    }

    return errors;
}

module.exports = {
    validateSystemSettingUpdate,
    validateSystemTestEmail
};
