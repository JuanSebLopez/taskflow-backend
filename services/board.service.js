const Board = require('../models/board');
const Task = require('../models/task');
const AppError = require('../utils/app-error');
const { ensureProjectAccess, ensureProjectWritable } = require('./project.service');

async function getBoardByProject(projectId, currentUser) {
    await ensureProjectAccess(projectId, currentUser);
    return Board.find({ project: projectId }).sort({ isDefault: -1, createdAt: 1 });
}

async function createBoard(projectId, payload, currentUser) {
    const project = await ensureProjectWritable(projectId, currentUser);

    return Board.create({
        name: payload.name || 'Nuevo tablero',
        project: project._id,
        columns: payload.columns || []
    });
}

async function addColumn(boardId, payload, currentUser) {
    const board = await Board.findById(boardId);

    if (!board) {
        throw new AppError('Board not found', 404);
    }

    await ensureProjectWritable(board.project, currentUser);
    board.columns.push({
        title: payload.title,
        order: payload.order || board.columns.length + 1,
        wipLimit: payload.wipLimit || 0
    });

    await board.save();
    return board;
}

async function updateColumn(boardId, columnId, payload, currentUser) {
    const board = await Board.findById(boardId);

    if (!board) {
        throw new AppError('Board not found', 404);
    }

    await ensureProjectWritable(board.project, currentUser);
    const column = board.columns.id(columnId);

    if (!column) {
        throw new AppError('Column not found', 404);
    }

    if (payload.title !== undefined) {
        column.title = payload.title;
    }

    if (payload.order !== undefined) {
        column.order = payload.order;
    }

    if (payload.wipLimit !== undefined) {
        column.wipLimit = payload.wipLimit;
    }

    await board.save();
    return board;
}

async function reorderColumns(boardId, columns, currentUser) {
    const board = await Board.findById(boardId);

    if (!board) {
        throw new AppError('Board not found', 404);
    }

    await ensureProjectWritable(board.project, currentUser);

    columns.forEach((item) => {
        const column = board.columns.id(item.columnId);
        if (column) {
            column.order = item.order;
        }
    });

    await board.save();
    return board;
}

async function deleteColumn(boardId, columnId, currentUser) {
    const board = await Board.findById(boardId);

    if (!board) {
        throw new AppError('Board not found', 404);
    }

    await ensureProjectWritable(board.project, currentUser);

    const tasksInColumn = await Task.countDocuments({ board: board._id, columnId });

    if (tasksInColumn > 0) {
        throw new AppError('Cannot delete a column that still contains tasks', 400);
    }

    board.columns.pull({ _id: columnId });
    await board.save();
    return board;
}

module.exports = {
    getBoardByProject,
    createBoard,
    addColumn,
    updateColumn,
    reorderColumns,
    deleteColumn
};
