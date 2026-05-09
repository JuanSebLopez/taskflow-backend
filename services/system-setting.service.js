const SystemSetting = require('../models/system-setting');
const AppError = require('../utils/app-error');
const { APP_THEMES } = require('../utils/constants');
const { createAuditLog } = require('./audit-log.service');
const { getEmailServiceStatus } = require('./email.service');

async function ensureSettingsDocument() {
    let settings = await SystemSetting.findOne({ singletonKey: 'SYSTEM_SETTINGS' });

    if (!settings) {
        settings = await SystemSetting.create({ singletonKey: 'SYSTEM_SETTINGS' });
    }

    return settings;
}

function normalizeSettingsPayload(payload = {}) {
    const next = {};

    if (payload.platformName !== undefined) {
        next.platformName = payload.platformName.trim();
    }

    if (payload.defaultTheme !== undefined) {
        next.defaultTheme = payload.defaultTheme;
    }

    if (payload.availableThemes !== undefined) {
        next.availableThemes = payload.availableThemes;
    }

    if (payload.maxAttachmentSizeMb !== undefined) {
        next.maxAttachmentSizeMb = payload.maxAttachmentSizeMb;
    }

    if (payload.passwordPolicy !== undefined) {
        next.passwordPolicy = payload.passwordPolicy;
    }

    return next;
}

async function getPublicSystemSettings() {
    const settings = await ensureSettingsDocument();

    return {
        platformName: settings.platformName,
        defaultTheme: settings.defaultTheme,
        availableThemes: settings.availableThemes,
        maxAttachmentSizeMb: settings.maxAttachmentSizeMb
    };
}

async function getSystemSettings() {
    const settings = await ensureSettingsDocument();
    const plain = settings.toObject();
    plain.emailService = getEmailServiceStatus();
    return plain;
}

async function updateSystemSettings(payload, currentUser) {
    const settings = await ensureSettingsDocument();
    const updates = normalizeSettingsPayload(payload);

    if (updates.defaultTheme && !APP_THEMES.includes(updates.defaultTheme)) {
        throw new AppError(`defaultTheme must be one of: ${APP_THEMES.join(', ')}`, 400);
    }

    if (updates.availableThemes) {
        const invalidTheme = updates.availableThemes.find((theme) => !APP_THEMES.includes(theme));
        if (invalidTheme) {
            throw new AppError(`availableThemes must only contain: ${APP_THEMES.join(', ')}`, 400);
        }
    }

    Object.assign(settings, updates);
    await settings.save();

    await createAuditLog({
        module: 'SETTINGS',
        action: 'SYSTEM_SETTINGS_UPDATED',
        actor: currentUser._id,
        resourceType: 'SystemSetting',
        resourceId: settings._id.toString(),
        metadata: {
            updatedFields: Object.keys(updates)
        }
    });

    return settings;
}

module.exports = {
    getPublicSystemSettings,
    getSystemSettings,
    updateSystemSettings
};
