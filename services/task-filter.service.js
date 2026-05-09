const SavedTaskFilter = require('../models/saved-task-filter');
const AppError = require('../utils/app-error');
const { createAuditLog } = require('./audit-log.service');
const { ensureProjectAccess } = require('./project.service');

function normalizeCriteria(criteria = {}) {
    const overdueOnly = criteria.overdueOnly === true
        ? true
        : criteria.overdueOnly === false
            ? false
            : null;

    return {
        search: criteria.search || '',
        boardId: criteria.boardId || null,
        columnId: criteria.columnId || null,
        assigneeId: criteria.assigneeId || null,
        labelName: criteria.labelName || '',
        priority: criteria.priority || '',
        type: criteria.type || '',
        dueDateFrom: criteria.dueDateFrom ? new Date(criteria.dueDateFrom) : null,
        dueDateTo: criteria.dueDateTo ? new Date(criteria.dueDateTo) : null,
        overdueOnly
    };
}

async function createSavedTaskFilter(payload, currentUser) {
    await ensureProjectAccess(payload.projectId, currentUser);

    const filter = await SavedTaskFilter.create({
        name: payload.name.trim(),
        owner: currentUser._id,
        project: payload.projectId,
        criteria: normalizeCriteria(payload.criteria)
    });

    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_FILTER_SAVED',
        actor: currentUser._id,
        project: payload.projectId,
        resourceType: 'SavedTaskFilter',
        resourceId: filter._id.toString(),
        metadata: {
            name: filter.name
        }
    });

    return filter;
}

async function listSavedTaskFilters(projectId, currentUser) {
    await ensureProjectAccess(projectId, currentUser);

    return SavedTaskFilter.find({
        owner: currentUser._id,
        project: projectId
    }).sort({ createdAt: -1 });
}

async function deleteSavedTaskFilter(filterId, currentUser) {
    const filter = await SavedTaskFilter.findById(filterId);

    if (!filter) {
        throw new AppError('Saved filter not found', 404);
    }

    if (filter.owner.toString() !== currentUser._id.toString() && currentUser.role !== 'ADMIN') {
        throw new AppError('You do not have permission to delete this saved filter', 403);
    }

    await ensureProjectAccess(filter.project, currentUser);
    await SavedTaskFilter.findByIdAndDelete(filter._id);

    await createAuditLog({
        module: 'TASKS',
        action: 'TASK_FILTER_DELETED',
        actor: currentUser._id,
        project: filter.project,
        resourceType: 'SavedTaskFilter',
        resourceId: filter._id.toString(),
        metadata: {
            name: filter.name
        }
    });
}

module.exports = {
    createSavedTaskFilter,
    listSavedTaskFilters,
    deleteSavedTaskFilter
};
