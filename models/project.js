const mongoose = require('mongoose');
const { PROJECT_STATUSES } = require('../utils/constants');

const ProjectMemberSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            default: 'MEMBER'
        },
        invitedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const ProjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        estimatedEndDate: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: PROJECT_STATUSES,
            default: 'PLANIFICADO'
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        members: [ProjectMemberSchema],
        isArchived: {
            type: Boolean,
            default: false
        },
        archivedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

ProjectSchema.methods.clonePrototype = function clonePrototype(newOwnerId) {
    return {
        name: `${this.name} (Copy)`,
        description: this.description,
        startDate: new Date(),
        estimatedEndDate: this.estimatedEndDate,
        status: 'PLANIFICADO',
        owner: newOwnerId,
        members: [{ user: newOwnerId, role: 'OWNER', invitedAt: new Date() }],
        isArchived: false,
        archivedAt: null
    };
};

module.exports = mongoose.model('Project', ProjectSchema);
