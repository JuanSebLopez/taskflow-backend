const { APP_THEMES } = require('../utils/constants');

function validateSystemSettingUpdate(body) {
    const errors = [];

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

module.exports = {
    validateSystemSettingUpdate
};
