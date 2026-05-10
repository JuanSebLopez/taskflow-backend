const catchAsync = require('../utils/catch-async');
const { serializeTask, serializeTaskListItem, serializeTaskMutation } = require('../serializers');
const taskFacade = require('../services/facades/task.facade');

const list = catchAsync(async (req, res) => {
    const tasks = await taskFacade.listProjectTasks(req.query, req.user);
    res.json(tasks.map(serializeTaskListItem));
});

const getById = catchAsync(async (req, res) => {
    const task = await taskFacade.getTaskDetails(req.params.id, req.user);
    res.json(serializeTask(task));
});

const create = catchAsync(async (req, res) => {
    const task = await taskFacade.createTaskEntry(req.body, req.user);
    res.status(201).json({
        message: 'Task created successfully',
        task: serializeTaskMutation(task)
    });
});

const update = catchAsync(async (req, res) => {
    const task = await taskFacade.updateTaskEntry(req.params.id, req.body, req.user);
    res.json({
        message: 'Task updated successfully',
        task: serializeTaskMutation(task)
    });
});

const assign = catchAsync(async (req, res) => {
    const task = await taskFacade.assignTaskMembersToTask(req.params.id, req.body, req.user);
    res.json({
        message: 'Task assignees updated successfully',
        task: serializeTaskMutation(task)
    });
});

const addSubtaskItem = catchAsync(async (req, res) => {
    const task = await taskFacade.addSubtaskToTask(req.params.id, req.body, req.user);
    res.json({
        message: 'Subtask added successfully',
        task: serializeTaskMutation(task)
    });
});

const updateSubtaskItem = catchAsync(async (req, res) => {
    const task = await taskFacade.updateSubtaskOnTask(req.params.id, req.params.subtaskId, req.body, req.user);
    res.json({
        message: 'Subtask updated successfully',
        task: serializeTaskMutation(task)
    });
});

const removeSubtaskItem = catchAsync(async (req, res) => {
    const task = await taskFacade.removeSubtaskFromTask(req.params.id, req.params.subtaskId, req.user);
    res.json({
        message: 'Subtask deleted successfully',
        task: serializeTaskMutation(task)
    });
});

const move = catchAsync(async (req, res) => {
    const task = await taskFacade.moveTaskToColumn(req.params.id, req.body, req.user);
    res.json({
        message: 'Task moved successfully',
        task: serializeTaskMutation(task)
    });
});

const clone = catchAsync(async (req, res) => {
    const task = await taskFacade.cloneTaskAsTemplate(req.params.id, req.user, req.body);
    res.status(201).json({
        message: 'Task cloned successfully',
        task: serializeTaskMutation(task)
    });
});

const comment = catchAsync(async (req, res) => {
    const task = await taskFacade.addCommentToTask(req.params.id, req.body, req.user);
    res.json({
        message: 'Comment added successfully',
        task: serializeTaskMutation(task)
    });
});

const editComment = catchAsync(async (req, res) => {
    const task = await taskFacade.updateTaskComment(req.params.id, req.params.commentId, req.body, req.user);
    res.json({
        message: 'Comment updated successfully',
        task: serializeTaskMutation(task)
    });
});

const removeComment = catchAsync(async (req, res) => {
    const task = await taskFacade.removeTaskComment(req.params.id, req.params.commentId, req.user);
    res.json({
        message: 'Comment deleted successfully',
        task: serializeTaskMutation(task)
    });
});

const uploadAttachments = catchAsync(async (req, res) => {
    const task = await taskFacade.uploadTaskAttachments(req.params.id, req.files, req.user);
    res.json({
        message: 'Attachments uploaded successfully',
        task: serializeTaskMutation(task)
    });
});

const removeAttachment = catchAsync(async (req, res) => {
    const task = await taskFacade.removeTaskAttachment(req.params.id, req.params.attachmentId, req.user);
    res.json({
        message: 'Attachment deleted successfully',
        task: serializeTaskMutation(task)
    });
});

const timeLog = catchAsync(async (req, res) => {
    const task = await taskFacade.addTaskTimeLog(req.params.id, req.body, req.user);
    res.json({
        message: 'Time log added successfully',
        task: serializeTaskMutation(task)
    });
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
