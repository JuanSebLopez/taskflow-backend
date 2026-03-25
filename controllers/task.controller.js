const catchAsync = require('../utils/catch-async');
const {
    addAttachments,
    addComment,
    addSubtask,
    addTimeLog,
    assignTaskMembers,
    cloneTask,
    createTask,
    deleteAttachment,
    deleteComment,
    deleteSubtask,
    getTask,
    listTasks,
    moveTask,
    updateComment,
    updateSubtask,
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

const assign = catchAsync(async (req, res) => {
    const task = await assignTaskMembers(req.params.id, req.body, req.user);
    res.json(task);
});

const addSubtaskItem = catchAsync(async (req, res) => {
    const task = await addSubtask(req.params.id, req.body, req.user);
    res.json(task);
});

const updateSubtaskItem = catchAsync(async (req, res) => {
    const task = await updateSubtask(req.params.id, req.params.subtaskId, req.body, req.user);
    res.json(task);
});

const removeSubtaskItem = catchAsync(async (req, res) => {
    const task = await deleteSubtask(req.params.id, req.params.subtaskId, req.user);
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

const uploadAttachments = catchAsync(async (req, res) => {
    const task = await addAttachments(req.params.id, req.files, req.user);
    res.json(task);
});

const removeAttachment = catchAsync(async (req, res) => {
    const task = await deleteAttachment(req.params.id, req.params.attachmentId, req.user);
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
    assign,
    addSubtask: addSubtaskItem,
    updateSubtask: updateSubtaskItem,
    removeSubtask: removeSubtaskItem,
    move,
    clone,
    comment,
    editComment,
    removeComment,
    uploadAttachments,
    removeAttachment,
    timeLog
};