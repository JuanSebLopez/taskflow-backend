const mongoose = require('mongoose');
const { AUDIT_MODULES } = require('../utils/constants');

const AuditLogSchema = new mongoose.Schema(
    {
        module: {
            type: String,
            enum: AUDIT_MODULES,
            required: true,
            index: true
        },
        action: {
            type: String,
            required: true,
            trim: true
        },
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null,
            index: true
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            default: null,
            index: true
        },
        resourceType: {
            type: String,
            required: true,
            trim: true
        },
        resourceId: {
            type: String,
            required: true,
            trim: true
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
