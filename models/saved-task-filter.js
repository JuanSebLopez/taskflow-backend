const mongoose = require('mongoose');
const { TASK_PRIORITIES, TASK_TYPES } = require('../utils/constants');

const SavedTaskFilterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true
        },
        criteria: {
            search: { type: String, default: '' },
            boardId: { type: mongoose.Schema.Types.ObjectId, default: null },
            columnId: { type: mongoose.Schema.Types.ObjectId, default: null },
            assigneeId: { type: mongoose.Schema.Types.ObjectId, default: null },
            labelName: { type: String, default: '' },
            priority: { type: String, enum: [...TASK_PRIORITIES, ''], default: '' },
            type: { type: String, enum: [...TASK_TYPES, ''], default: '' },
            dueDateFrom: { type: Date, default: null },
            dueDateTo: { type: Date, default: null },
            overdueOnly: { type: Boolean, default: null }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('SavedTaskFilter', SavedTaskFilterSchema);
