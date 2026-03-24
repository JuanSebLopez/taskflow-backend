const Board = require('../models/board');
const Task = require('../models/task');
const AppError = require('../utils/app-error');
const TaskBuilder = require('../builders/task.builder');
const taskFactory = require('../factories/task.factory');
const { ensureProjectAccess } = require('./project.service');

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

    return Task.find(filter)
        .populate('assignees', 'fullName email role')
        .populate('createdBy', 'fullName email');
}

async function createTask(payload, currentUser) {
    await ensureProjectAccess(payload.project, currentUser);
    const { board } = await ensureBoardAndColumn(payload.project, payload.board, payload.columnId);
    await validateWipLimit(board, payload.columnId);

    const creator = taskFactory.getCreator(payload.type);
    const baseData = creator.create(payload);
    const taskData = new TaskBuilder({
        ...baseData,
        createdBy: currentUser._id
    })
        .withLabels(payload.labels)
        .withAssignees(payload.assignees)
        .withSubtasks(payload.subtasks)
        .build();

    taskData.history = [
        {
            action: 'TASK_CREATED',
            performedBy: currentUser._id,
            toColumnId: payload.columnId,
            metadata: { type: taskData.type }
        }
    ];

    return Task.create(taskData);
}

async function getTask(taskId, currentUser) {
    const task = await Task.findById(taskId)
        .populate('assignees', 'fullName email role')
        .populate('createdBy', 'fullName email')
        .populate('comments.author', 'fullName email');

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

    await ensureProjectAccess(task.project, currentUser);

    ['title', 'description', 'priority', 'type', 'dueDate', 'estimatedHours'].forEach((field) => {
        if (payload[field] !== undefined) {
            task[field] = payload[field];
        }
    });

    if (payload.labels) {
        task.labels = payload.labels;
    }

    if (payload.assignees) {
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
    return task;
}

async function moveTask(taskId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectAccess(task.project, currentUser);
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
    return task;
}

async function cloneTask(taskId, currentUser, overrides = {}) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectAccess(task.project, currentUser);
    const clonedTask = await Task.create(task.clonePrototype(currentUser._id, overrides));

    clonedTask.history.push({
        action: 'TASK_CLONED',
        performedBy: currentUser._id,
        toColumnId: clonedTask.columnId,
        metadata: { sourceTaskId: task._id }
    });

    await clonedTask.save();
    return clonedTask;
}

async function addComment(taskId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectAccess(task.project, currentUser);
    task.comments.push({
        author: currentUser._id,
        content: payload.content
    });
    task.history.push({
        action: 'COMMENT_ADDED',
        performedBy: currentUser._id
    });
    await task.save();
    return task;
}

async function updateComment(taskId, commentId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectAccess(task.project, currentUser);
    const comment = task.comments.id(commentId);

    if (!comment) {
        throw new AppError('Comment not found', 404);
    }

    if (comment.author.toString() !== currentUser._id.toString()) {
        throw new AppError('You can only edit your own comments', 403);
    }

    comment.content = payload.content;
    comment.editedAt = new Date();
    await task.save();
    return task;
}

async function deleteComment(taskId, commentId, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectAccess(task.project, currentUser);
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
    return task;
}

async function addTimeLog(taskId, payload, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    await ensureProjectAccess(task.project, currentUser);
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
    return task;
}

module.exports = {
    listTasks,
    createTask,
    getTask,
    updateTask,
    moveTask,
    cloneTask,
    addComment,
    updateComment,
    deleteComment,
    addTimeLog
};
