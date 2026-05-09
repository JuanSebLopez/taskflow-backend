const mongoose = require('mongoose');
const { APP_THEMES } = require('../utils/constants');

const PasswordPolicySchema = new mongoose.Schema(
    {
        minLength: { type: Number, default: 6 },
        requireUppercase: { type: Boolean, default: false },
        requireNumber: { type: Boolean, default: false },
        requireSpecialChar: { type: Boolean, default: false }
    },
    { _id: false }
);

const SystemSettingSchema = new mongoose.Schema(
    {
        singletonKey: {
            type: String,
            default: 'SYSTEM_SETTINGS',
            unique: true
        },
        platformName: {
            type: String,
            default: 'TaskFlow',
            trim: true
        },
        defaultTheme: {
            type: String,
            enum: APP_THEMES,
            default: 'LIGHT'
        },
        availableThemes: {
            type: [String],
            enum: APP_THEMES,
            default: ['LIGHT', 'DARK']
        },
        maxAttachmentSizeMb: {
            type: Number,
            default: 10,
            min: 1
        },
        passwordPolicy: {
            type: PasswordPolicySchema,
            default: () => ({})
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('SystemSetting', SystemSettingSchema);
