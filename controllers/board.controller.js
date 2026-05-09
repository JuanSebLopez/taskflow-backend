const catchAsync = require('../utils/catch-async');
const { serializeBoard } = require('../serializers');
const {
    addColumn,
    createBoard,
    deleteColumn,
    getBoardByProject,
    reorderColumns,
    updateColumn
} = require('../services/board.service');

const getByProject = catchAsync(async (req, res) => {
    const boards = await getBoardByProject(req.params.projectId, req.user);
    res.json(boards.map(serializeBoard));
});

const create = catchAsync(async (req, res) => {
    const board = await createBoard(req.params.projectId, req.body, req.user);
    res.status(201).json(serializeBoard(board));
});

const createColumn = catchAsync(async (req, res) => {
    const board = await addColumn(req.params.boardId, req.body, req.user);
    res.json(serializeBoard(board));
});

const editColumn = catchAsync(async (req, res) => {
    const board = await updateColumn(req.params.boardId, req.params.columnId, req.body, req.user);
    res.json(serializeBoard(board));
});

const reorder = catchAsync(async (req, res) => {
    const board = await reorderColumns(req.params.boardId, req.body.columns, req.user);
    res.json(serializeBoard(board));
});

const removeColumn = catchAsync(async (req, res) => {
    const board = await deleteColumn(req.params.boardId, req.params.columnId, req.user);
    res.json(serializeBoard(board));
});

module.exports = {
    getByProject,
    create,
    createColumn,
    editColumn,
    reorder,
    removeColumn
};
