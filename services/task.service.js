const fs = require('fs');
const path = require('path');
const Board = require('../models/board');
const Task = require('../models/task');
const AppError = require('../utils/app-error');
const TaskBuilder = require('../builders/task.builder');
const taskFactory = require('../factories/task.factory');
const { createAuditLog } = require('./audit-log.service');
const { notifyMany } = require('./notification.service');
const { ensureProjectAccess, ensureProjectWritable } = require('./project.service');

async function ensureBoardAndColumn(projectId, boardId, columnId) {
    const board = await Board.findOne({ _id: boardId, project: projectId });

    if (!board) {
        throw new AppError('Board not found for the selected project', 404);
    }

    const column = board.columns.id(columnId);

    if (!column) {
        throw new AppError('Selected column was not found', 404);
    }

    return { board, column };
}

async function validateWipLimit(board, columnId, excludingTaskId = null) {
    const column = board.columns.id(columnId);

    if (!column || !column.wipLimit) {
        return;
    }

    const filter = { board: board._id, columnId };
    if (excludingTaskId) {
        filter._id = { $ne: excludingTaskId };
    }

    const currentTasks = await Task.countDocuments(filter);

    if (currentTasks >= column.wipLimit) {
        throw new AppError(`WIP limit reached for column "${column.title}"`, 400);
    }
}

async function validateAssignees(project, assigneeIds = []) {
    if (!Array.isArray(assigneeIds) || assigneeIds.length === 0) {
        return [];
    }

    const allowedIds = new Set([
        project.owner.toString(),
        ...project.members.map((member) => member.user.toString())
    ]);

    assigneeIds.forEach((assigneeId) => {
        if (!allowedIds.has(assigneeId.toString())) {
            throw new AppError('Assignees must belong to the project members list', 400);
        }
    });

    return assigneeIds;
}

function removeStoredFile(relativePath) {
    if (!relativePath) {
        return;
    }

    const absolutePath = path.join(__dirname, '..', relativePath);
    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
}

function buildAttachmentRecord(file, currentUser) {
    const relativePath = path.join('uploads', 'tasks', file.filename);

    return {
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        relativePath,
        url: `/${relativePath.replace(/\\/g, '/')}`,
        uploadedBy: currentUser._id
    };
}

function validateSubtaskPayload(subtask) {
    if (!subtask || typeof subtask.title !== 'string' || !subtask.title.trim()) {
        throw new AppError('Subtask title is required', 400);
    }
}

function withoutActor(userIds = [], actorId) {
    return [...new Set(userIds.map((userId) => userId.toString()))].filter(
        (userId) => userId !== actorId.toString()
    );
}

function populateTaskQuery(query) {
    return query
        .populate('assignees', 'fullName email role')
        .populate('createdBy', 'fullName email')
        .populate('comments.author', 'fullName email')
        .populate('attachments.uploadedBy', 'fullName email');
}

async function listTasks(query, currentUser) {
    if (!query.projectId) {
        throw new AppError('projectId query parameter is required', 400);
    }

    await ensureProjectAccess(query.projectId, currentUser);

    const filter = { project: query.projectId };

    if (query.boardId) {
        filter.board = query.boardId;
    }

    if (query.columnId) {
        filter.columnId = query.columnId;
    }

    if (query.search) {
        filter.$or = [
            { title: { $regex: query.search, $options: 'i' } },
            { description: { $regex: query.search, $options: 'i' } }
        ];
    }

    if (query.priority) {
        filter.priority = query.priority;
    }

    if (query.type) {
        filter.type = query.type;
    }

    return populateTaskQuery(Task.find(filter));
}

async function createTask(payload, currentUser) {
    const project = await ensureProjectWritable(payload.project, currentUser);
    const { board } = await ensureBoardAndColumn(payload.project, payload.board, payload.columnId);
    await validateWipLimit(board, payload.columnId);
    await validateAssignees(project, payload.assignees || []);

    const creator = taskFactory.getCreator(payload.type);
    const baseData = creator.create(payload);
    const taskData = new TaskBuilder({
        ...baseData,
        createdBy: currentUser._id
    })
        .withLabels(payload.labels)
        .withAssignees(payload.assignees)
        .withSubtasks(payload.subtasks)
        .withHistory([
            {
                action: 'TASK_CREATED',
                performedBy: currentUser._id,
                toColumnId: payload.columnId,
                metadata: { type: baseData.type || payload.type || 'TASK' }
            }
        ])
        .build();

    const task = await Task.create(taskData);
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_CREATED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: {
            title: task.title,
            type: task.type,
            columnId: task.columnId.toString()
        }
    });
    return getTask(task._id, currentUser);
}

async function getTask(taskId, currentUser) {
    const task = await populateTaskQuery(Task.findById(taskId));

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectAccess(task.project, currentUser);
    return task;
}

async function updateTask(taskId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    const project = await ensureProjectWritable(task.project, currentUser);

    ['title', 'description', 'priority', 'type', 'dueDate', 'estimatedHours'].forEach((field) => {
        if (payload[field] !== undefined) {
            task[field] = payload[field];
        }
    });

    if (payload.labels) {
        task.labels = payload.labels;
    }

    if (payload.assignees) {
        await validateAssignees(project, payload.assignees);
        task.assignees = payload.assignees;
    }

    if (payload.subtasks) {
        task.subtasks = payload.subtasks;
    }

    task.history.push({
        action: 'TASK_UPDATED',
        performedBy: currentUser._id,
        metadata: { updatedFields: Object.keys(payload) }
    });

    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_UPDATED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: { updatedFields: Object.keys(payload) }
    });
    return getTask(task._id, currentUser);
}

async function assignTaskMembers(taskId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    const project = await ensureProjectWritable(task.project, currentUser);
    await validateAssignees(project, payload.assignees);

    task.assignees = payload.assignees;
    task.history.push({
        action: 'ASSIGNEES_UPDATED',
        performedBy: currentUser._id,
        metadata: { assigneeCount: payload.assignees.length }
    });

    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_ASSIGNEES_UPDATED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: { assigneeIds: payload.assignees }
    });
    await notifyMany(withoutActor(payload.assignees, currentUser._id), {
        type: 'TASK_ASSIGNED',
        title: 'Nueva asignacion de tarea',
        message: `Se te asigno la tarea "${task.title}"`,
        relatedProject: task.project,
        relatedTask: task._id,
        metadata: {
            taskId: task._id.toString(),
            projectId: task.project.toString()
        }
    });
    return getTask(task._id, currentUser);
}

async function addSubtask(taskId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectWritable(task.project, currentUser);
    validateSubtaskPayload(payload);

    task.subtasks.push({
        title: payload.title.trim(),
        isCompleted: Boolean(payload.isCompleted)
    });
    task.history.push({
        action: 'SUBTASK_ADDED',
        performedBy: currentUser._id,
        metadata: { title: payload.title.trim() }
    });

    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_SUBTASK_ADDED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: { title: payload.title.trim() }
    });
    return getTask(task._id, currentUser);
}

async function updateSubtask(taskId, subtaskId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectWritable(task.project, currentUser);
    const subtask = task.subtasks.id(subtaskId);

    if (!subtask) {
        throw new AppError('Subtask not found', 404);
    }

    if (payload.title !== undefined) {
        validateSubtaskPayload({ title: payload.title });
        subtask.title = payload.title.trim();
    }

    if (payload.isCompleted !== undefined) {
        subtask.isCompleted = Boolean(payload.isCompleted);
    }

    task.history.push({
        action: 'SUBTASK_UPDATED',
        performedBy: currentUser._id,
        metadata: { subtaskId }
    });

    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_SUBTASK_UPDATED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: { subtaskId }
    });
    return getTask(task._id, currentUser);
}

async function deleteSubtask(taskId, subtaskId, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectWritable(task.project, currentUser);
    const subtask = task.subtasks.id(subtaskId);

    if (!subtask) {
        throw new AppError('Subtask not found', 404);
    }

    subtask.deleteOne();
    task.history.push({
        action: 'SUBTASK_DELETED',
        performedBy: currentUser._id,
        metadata: { subtaskId }
    });

    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_SUBTASK_DELETED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: { subtaskId }
    });
    return getTask(task._id, currentUser);
}

async function moveTask(taskId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectWritable(task.project, currentUser);
    const { board } = await ensureBoardAndColumn(task.project, task.board, payload.toColumnId);
    await validateWipLimit(board, payload.toColumnId, task._id);

    const fromColumnId = task.columnId;
    task.columnId = payload.toColumnId;
    task.history.push({
        action: 'TASK_MOVED',
        performedBy: currentUser._id,
        fromColumnId,
        toColumnId: payload.toColumnId
    });

    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_MOVED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: {
            fromColumnId: fromColumnId.toString(),
            toColumnId: payload.toColumnId.toString()
        }
    });
    await notifyMany(withoutActor(task.assignees, currentUser._id), {
        type: 'TASK_MOVED',
        title: 'Cambio de estado en tarea',
        message: `La tarea "${task.title}" cambio de columna`,
        relatedProject: task.project,
        relatedTask: task._id,
        metadata: {
            fromColumnId: fromColumnId.toString(),
            toColumnId: payload.toColumnId.toString()
        }
    });
    return getTask(task._id, currentUser);
}

async function cloneTask(taskId, currentUser, overrides = {}) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectWritable(task.project, currentUser);
    const clonedTask = await Task.create(task.clonePrototype(currentUser._id, overrides));

    clonedTask.history.push({
        action: 'TASK_CLONED',
        performedBy: currentUser._id,
        toColumnId: clonedTask.columnId,
        metadata: { sourceTaskId: task._id }
    });

    await clonedTask.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_CLONED',
        actor: currentUser._id,
        project: clonedTask.project,
        task: clonedTask._id,
        resourceType: 'Task',
        resourceId: clonedTask._id.toString(),
        metadata: { sourceTaskId: task._id.toString() }
    });
    return getTask(clonedTask._id, currentUser);
}

async function addComment(taskId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectWritable(task.project, currentUser);
    task.comments.push({
        author: currentUser._id,
        content: payload.content
    });
    task.history.push({
        action: 'COMMENT_ADDED',
        performedBy: currentUser._id
    });
    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_COMMENT_ADDED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: { contentLength: payload.content.length }
    });
    await notifyMany(withoutActor(task.assignees, currentUser._id), {
        type: 'TASK_COMMENTED',
        title: 'Nuevo comentario en tarea',
        message: `Se agrego un comentario en la tarea "${task.title}"`,
        relatedProject: task.project,
        relatedTask: task._id,
        metadata: { taskId: task._id.toString() }
    });
    return getTask(task._id, currentUser);
}

async function updateComment(taskId, commentId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectWritable(task.project, currentUser);
    const comment = task.comments.id(commentId);

    if (!comment) {
        throw new AppError('Comment not found', 404);
    }

    if (comment.author.toString() !== currentUser._id.toString()) {
        throw new AppError('You can only edit your own comments', 403);
    }

    comment.content = payload.content;
    comment.editedAt = new Date();
    task.history.push({
        action: 'COMMENT_UPDATED',
        performedBy: currentUser._id,
        metadata: { commentId }
    });
    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_COMMENT_UPDATED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: { commentId }
    });
    return getTask(task._id, currentUser);
}

async function deleteComment(taskId, commentId, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectWritable(task.project, currentUser);
    const comment = task.comments.id(commentId);

    if (!comment) {
        throw new AppError('Comment not found', 404);
    }

    if (comment.author.toString() !== currentUser._id.toString()) {
        throw new AppError('You can only delete your own comments', 403);
    }

    comment.deleteOne();
    task.history.push({
        action: 'COMMENT_DELETED',
        performedBy: currentUser._id
    });
    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_COMMENT_DELETED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: { commentId }
    });
    return getTask(task._id, currentUser);
}

async function addAttachments(taskId, files, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectWritable(task.project, currentUser);

    if (!files || files.length === 0) {
        throw new AppError('At least one file is required', 400);
    }

    files.forEach((file) => {
        task.attachments.push(buildAttachmentRecord(file, currentUser));
    });

    task.history.push({
        action: 'ATTACHMENT_ADDED',
        performedBy: currentUser._id,
        metadata: { count: files.length }
    });

    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_ATTACHMENT_ADDED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: { count: files.length }
    });
    return getTask(task._id, currentUser);
}

async function deleteAttachment(taskId, attachmentId, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectWritable(task.project, currentUser);
    const attachment = task.attachments.id(attachmentId);

    if (!attachment) {
        throw new AppError('Attachment not found', 404);
    }

    removeStoredFile(attachment.relativePath);
    attachment.deleteOne();
    task.history.push({
        action: 'ATTACHMENT_DELETED',
        performedBy: currentUser._id,
        metadata: { attachmentId }
    });

    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_ATTACHMENT_DELETED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: { attachmentId }
    });
    return getTask(task._id, currentUser);
}

async function addTimeLog(taskId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectWritable(task.project, currentUser);
    task.timeLogs.push({
        user: currentUser._id,
        hours: payload.hours,
        note: payload.note || ''
    });
    task.history.push({
        action: 'TIME_LOG_ADDED',
        performedBy: currentUser._id,
        metadata: { hours: payload.hours }
    });
    await task.save();
    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_TIME_LOG_ADDED',
        actor: currentUser._id,
        project: task.project,
        task: task._id,
        resourceType: 'Task',
        resourceId: task._id.toString(),
        metadata: { hours: payload.hours }
    });
    return getTask(task._id, currentUser);
}

module.exports = {
    listTasks,
    createTask,
    getTask,
    updateTask,
    assignTaskMembers,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    moveTask,
    cloneTask,
    addComment,
    updateComment,
    deleteComment,
    addAttachments,
    deleteAttachment,
    addTimeLog
};
