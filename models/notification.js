const mongoose = require('mongoose');
const { NOTIFICATION_CHANNELS, NOTIFICATION_TYPES } = require('../utils/constants');

const NotificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: NOTIFICATION_TYPES,
            required: true
        },
        channel: {
            type: String,
            enum: NOTIFICATION_CHANNELS,
            default: 'IN_APP'
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        relatedProject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null
        },
        relatedTask: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            default: null
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
