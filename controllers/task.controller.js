const catchAsync = require('../utils/catch-async');
const {
    addComment,
    addTimeLog,
    cloneTask,
    createTask,
    deleteComment,
    getTask,
    listTasks,
    moveTask,
    updateComment,
    updateTask
} = require('../services/task.service');

const list = catchAsync(async (req, res) => {
    const tasks = await listTasks(req.query, req.user);
    res.json(tasks);
});

const getById = catchAsync(async (req, res) => {
    const task = await getTask(req.params.id, req.user);
    res.json(task);
});

const create = catchAsync(async (req, res) => {
    const task = await createTask(req.body, req.user);
    res.status(201).json(task);
});

const update = catchAsync(async (req, res) => {
    const task = await updateTask(req.params.id, req.body, req.user);
    res.json(task);
});

const move = catchAsync(async (req, res) => {
    const task = await moveTask(req.params.id, req.body, req.user);
    res.json(task);
});

const clone = catchAsync(async (req, res) => {
    const task = await cloneTask(req.params.id, req.user, req.body);
    res.status(201).json(task);
});

const comment = catchAsync(async (req, res) => {
    const task = await addComment(req.params.id, req.body, req.user);
    res.json(task);
});

const editComment = catchAsync(async (req, res) => {
    const task = await updateComment(req.params.id, req.params.commentId, req.body, req.user);
    res.json(task);
});

const removeComment = catchAsync(async (req, res) => {
    const task = await deleteComment(req.params.id, req.params.commentId, req.user);
    res.json(task);
});

const timeLog = catchAsync(async (req, res) => {
    const task = await addTimeLog(req.params.id, req.body, req.user);
    res.json(task);
});

module.exports = {
    list,
    getById,
    create,
    update,
    move,
    clone,
    comment,
    editComment,
    removeComment,
    timeLog
};
