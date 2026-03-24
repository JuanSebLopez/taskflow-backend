const mongoose = require('mongoose');

const BoardColumnSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        order: {
            type: Number,
            required: true
        },
        wipLimit: {
            type: Number,
            default: 0
        }
    },
    { timestamps: false }
);

const BoardSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'Tablero Principal'
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        isDefault: {
            type: Boolean,
            default: false
        },
        columns: [BoardColumnSchema]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Board', BoardSchema);
