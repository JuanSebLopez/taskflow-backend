const AuditLog = require('../models/audit-log');
const Project = require('../models/project');
const Task = require('../models/task');
const AppError = require('../utils/app-error');

async function ensureAuditProjectAccess(projectId, currentUser) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    const isOwner = project.owner.toString() === currentUser._id.toString();
    const isMember = project.members.some((member) => member.user.toString() === currentUser._id.toString());
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isOwner && !isMember && !isAdmin) {
        throw new AppError('You do not have access to this project', 403);
    }

    return project;
}

async function createAuditLog(entry) {
    return AuditLog.create({
        module: entry.module,
        action: entry.action,
        actor: entry.actor,
        project: entry.project || null,
        task: entry.task || null,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        metadata: entry.metadata || {}
    });
}

async function listAuditLogs(query, currentUser) {
    const filter = {};

    if (query.projectId) {
        await ensureAuditProjectAccess(query.projectId, currentUser);
        filter.project = query.projectId;
    }

    if (query.taskId) {
        const task = await Task.findById(query.taskId);

        if (!task) {
            throw new AppError('Task not found', 404);
        }

        await ensureAuditProjectAccess(task.project, currentUser);
        filter.task = query.taskId;
    }

    if (query.module) {
        filter.module = query.module;
    }

    if (query.action) {
        filter.action = query.action;
    }

    if (query.actorId) {
        filter.actor = query.actorId;
    }

    if (!query.projectId && !query.taskId && currentUser.role !== 'ADMIN') {
        throw new AppError('projectId or taskId is required for non-admin users', 400);
    }

    return AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .populate('actor', 'fullName email role')
        .populate('project', 'name status')
        .populate('task', 'title type priority');
}

module.exports = {
    createAuditLog,
    listAuditLogs
};
