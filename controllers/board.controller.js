const catchAsync = require('../utils/catch-async');
const { serializeBoard, serializeBoardMutation } = require('../serializers');
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
    res.status(201).json({
        message: 'Board created successfully',
        board: serializeBoardMutation(board)
    });
});

const createColumn = catchAsync(async (req, res) => {
    const board = await addColumn(req.params.boardId, req.body, req.user);
    res.json({
        message: 'Column created successfully',
        board: serializeBoardMutation(board)
    });
});

const editColumn = catchAsync(async (req, res) => {
    const board = await updateColumn(req.params.boardId, req.params.columnId, req.body, req.user);
    res.json({
        message: 'Column updated successfully',
        board: serializeBoardMutation(board)
    });
});

const reorder = catchAsync(async (req, res) => {
    const board = await reorderColumns(req.params.boardId, req.body.columns, req.user);
    res.json({
        message: 'Columns reordered successfully',
        board: serializeBoardMutation(board)
    });
});

const removeColumn = catchAsync(async (req, res) => {
    const board = await deleteColumn(req.params.boardId, req.params.columnId, req.user);
    res.json({
        message: 'Column deleted successfully',
        board: serializeBoardMutation(board)
    });
});

module.exports = {
    getByProject,
    create,
    createColumn,
    editColumn,
    reorder,
    removeColumn
};
