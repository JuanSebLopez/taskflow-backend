const mongoose = require('mongoose');
const { USER_ROLES } = require('../utils/constants');

const NotificationPreferenceChannelSchema = new mongoose.Schema(
    {
        projectMemberAdded: { type: Boolean, default: true },
        projectArchived: { type: Boolean, default: true },
        taskAssigned: { type: Boolean, default: true },
        taskMoved: { type: Boolean, default: true },
        taskCommented: { type: Boolean, default: true }
    },
    { _id: false }
);

const UserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        role: {
            type: String,
            enum: USER_ROLES,
            default: 'DEVELOPER'
        },
        avatarUrl: {
            type: String,
            default: ''
        },
        bio: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true
        },
        sessionVersion: {
            type: Number,
            default: 1
        },
        lastAccessAt: {
            type: Date,
            default: null
        },
        notificationPreferences: {
            inApp: {
                type: NotificationPreferenceChannelSchema,
                default: () => ({})
            },
            email: {
                type: NotificationPreferenceChannelSchema,
                default: () => ({
                    projectMemberAdded: false,
                    projectArchived: false,
                    taskAssigned: false,
                    taskMoved: false,
                    taskCommented: false
                })
            }
        }
    },
    { timestamps: true }
);

UserSchema.methods.toSafeObject = function toSafeObject() {
    return {
        id: this._id,
        fullName: this.fullName,
        email: this.email,
        role: this.role,
        avatarUrl: this.avatarUrl,
        bio: this.bio,
        isActive: this.isActive,
        lastAccessAt: this.lastAccessAt,
        notificationPreferences: this.notificationPreferences,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

module.exports = mongoose.model('User', UserSchema);
