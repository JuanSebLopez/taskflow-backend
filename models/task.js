const mongoose = require('mongoose');
const { TASK_PRIORITIES, TASK_TYPES } = require('../utils/constants');

const LabelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        color: { type: String, default: '#6b7280' }
    },
    { _id: false }
);

const CommentSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        editedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

const SubtaskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false }
    },
    { timestamps: false }
);

const AttachmentSchema = new mongoose.Schema(
    {
        originalName: { type: String, required: true },
        storedName: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        relativePath: { type: String, required: true },
        url: { type: String, required: true },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

const TimeLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        hours: {
            type: Number,
            required: true,
            min: 0.25
        },
        note: {
            type: String,
            default: ''
        },
        loggedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const HistorySchema = new mongoose.Schema(
    {
        action: { type: String, required: true },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        fromColumnId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        toColumnId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const TaskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        priority: { type: String, enum: TASK_PRIORITIES, default: 'MEDIA' },
        type: { type: String, enum: TASK_TYPES, default: 'TASK' },
        dueDate: { type: Date, default: null },
        estimatedHours: { type: Number, default: 0 },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Board',
            required: true
        },
        columnId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        labels: [LabelSchema],
        comments: [CommentSchema],
        subtasks: [SubtaskSchema],
        attachments: [AttachmentSchema],
        timeLogs: [TimeLogSchema],
        history: [HistorySchema]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

TaskSchema.virtual('subtaskProgress').get(function getSubtaskProgress() {
    if (!Array.isArray(this.subtasks) || this.subtasks.length === 0) {
        return 0;
    }

    const completed = this.subtasks.filter((subtask) => subtask.isCompleted).length;
    return Math.round((completed / this.subtasks.length) * 100);
});

TaskSchema.methods.clonePrototype = function clonePrototype(newUserId, overrides = {}) {
    return {
        title: `${this.title} (Copy)`,
        description: this.description,
        priority: this.priority,
        type: this.type,
        dueDate: overrides.dueDate || this.dueDate,
        estimatedHours: this.estimatedHours,
        project: overrides.project || this.project,
        board: overrides.board || this.board,
        columnId: overrides.columnId || this.columnId,
        createdBy: newUserId,
        assignees: overrides.assignees || this.assignees,
        labels: this.labels,
        subtasks: this.subtasks.map((subtask) => ({
            title: subtask.title,
            isCompleted: false
        })),
        attachments: [],
        comments: [],
        timeLogs: [],
        history: []
    };
};

module.exports = mongoose.model('Task', TaskSchema);
