function toPlain(value) {
    if (!value) {
        return null;
    }

    if (typeof value.toObject === 'function') {
        return value.toObject({ virtuals: true });
    }

    return value;
}

function toId(value) {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (value._id) {
        return value._id.toString();
    }

    if (value.id) {
        return value.id.toString();
    }

    if (typeof value.toString === 'function') {
        return value.toString();
    }

    return null;
}

function serializeCompactUser(user) {
    if (!user) {
        return null;
    }

    const plain = toPlain(user);

    return {
        id: toId(plain),
        fullName: plain.fullName || '',
        role: plain.role || null,
        avatarUrl: plain.avatarUrl || ''
    };
}

function serializeUser(user) {
    if (!user) {
        return null;
    }

    const plain = typeof user.toSafeObject === 'function' ? user.toSafeObject() : toPlain(user);

    return {
        id: plain.id || toId(plain),
        fullName: plain.fullName,
        email: plain.email,
        role: plain.role,
        avatarUrl: plain.avatarUrl || '',
        bio: plain.bio || '',
        isActive: plain.isActive,
        lastAccessAt: plain.lastAccessAt || null,
        notificationPreferences: plain.notificationPreferences || null,
        createdAt: plain.createdAt || null,
        updatedAt: plain.updatedAt || null
    };
}

function serializeProjectMember(member) {
    if (!member) {
        return null;
    }

    const user = member.user && typeof member.user === 'object'
        ? serializeCompactUser(member.user)
        : { id: toId(member.user) };

    return {
        user,
        role: member.role || 'MEMBER',
        invitedAt: member.invitedAt || null
    };
}

function serializeProject(project) {
    if (!project) {
        return null;
    }

    const plain = toPlain(project);
    const members = Array.isArray(plain.members) ? plain.members.map(serializeProjectMember) : [];

    return {
        id: toId(plain),
        name: plain.name,
        description: plain.description || '',
        startDate: plain.startDate || null,
        estimatedEndDate: plain.estimatedEndDate || null,
        status: plain.status,
        isArchived: Boolean(plain.isArchived),
        archivedAt: plain.archivedAt || null,
        owner: plain.owner && typeof plain.owner === 'object'
            ? serializeCompactUser(plain.owner)
            : { id: toId(plain.owner) },
        members,
        memberCount: members.length,
        progress: typeof plain.progress === 'number' ? plain.progress : undefined,
        createdAt: plain.createdAt || null,
        updatedAt: plain.updatedAt || null
    };
}

function serializeProjectSummary(project) {
    if (!project) {
        return null;
    }

    const plain = toPlain(project);

    return {
        id: toId(plain),
        name: plain.name,
        status: plain.status,
        isArchived: Boolean(plain.isArchived)
    };
}

function serializeBoardColumn(column) {
    if (!column) {
        return null;
    }

    const plain = toPlain(column);

    return {
        id: toId(plain),
        title: plain.title,
        order: plain.order,
        wipLimit: plain.wipLimit || 0
    };
}

function serializeBoard(board) {
    if (!board) {
        return null;
    }

    const plain = toPlain(board);

    return {
        id: toId(plain),
        name: plain.name,
        projectId: toId(plain.project),
        isDefault: Boolean(plain.isDefault),
        columns: Array.isArray(plain.columns) ? plain.columns.map(serializeBoardColumn) : [],
        createdAt: plain.createdAt || null,
        updatedAt: plain.updatedAt || null
    };
}

function serializeTaskComment(comment) {
    if (!comment) {
        return null;
    }

    const plain = toPlain(comment);

    return {
        id: toId(plain),
        author: serializeCompactUser(plain.author),
        content: plain.content,
        editedAt: plain.editedAt || null,
        createdAt: plain.createdAt || null,
        updatedAt: plain.updatedAt || null
    };
}

function serializeTaskAttachment(attachment) {
    if (!attachment) {
        return null;
    }

    const plain = toPlain(attachment);

    return {
        id: toId(plain),
        originalName: plain.originalName,
        mimeType: plain.mimeType,
        size: plain.size,
        url: plain.url,
        uploadedBy: serializeCompactUser(plain.uploadedBy),
        uploadedAt: plain.uploadedAt || null
    };
}

function serializeTaskHistoryEntry(entry) {
    if (!entry) {
        return null;
    }

    const plain = toPlain(entry);

    return {
        action: plain.action,
        performedBy: plain.performedBy && typeof plain.performedBy === 'object'
            ? serializeCompactUser(plain.performedBy)
            : { id: toId(plain.performedBy) },
        fromColumnId: toId(plain.fromColumnId),
        toColumnId: toId(plain.toColumnId),
        metadata: plain.metadata || {},
        createdAt: plain.createdAt || null
    };
}

function serializeTimeLog(timeLog) {
    if (!timeLog) {
        return null;
    }

    const plain = toPlain(timeLog);

    return {
        user: serializeCompactUser(plain.user),
        hours: plain.hours,
        note: plain.note || '',
        loggedAt: plain.loggedAt || null
    };
}

function serializeSubtask(subtask) {
    if (!subtask) {
        return null;
    }

    const plain = toPlain(subtask);

    return {
        id: toId(plain),
        title: plain.title,
        isCompleted: Boolean(plain.isCompleted)
    };
}

function serializeTask(task) {
    if (!task) {
        return null;
    }

    const plain = toPlain(task);

    return {
        id: toId(plain),
        title: plain.title,
        description: plain.description || '',
        priority: plain.priority,
        type: plain.type,
        dueDate: plain.dueDate || null,
        estimatedHours: plain.estimatedHours || 0,
        projectId: toId(plain.project),
        boardId: toId(plain.board),
        columnId: toId(plain.columnId),
        createdBy: serializeCompactUser(plain.createdBy),
        assignees: Array.isArray(plain.assignees) ? plain.assignees.map(serializeCompactUser) : [],
        labels: Array.isArray(plain.labels) ? plain.labels.map((label) => ({
            name: label.name,
            color: label.color || '#6b7280'
        })) : [],
        subtasks: Array.isArray(plain.subtasks) ? plain.subtasks.map(serializeSubtask) : [],
        subtaskProgress: plain.subtaskProgress || 0,
        comments: Array.isArray(plain.comments) ? plain.comments.map(serializeTaskComment) : [],
        attachments: Array.isArray(plain.attachments) ? plain.attachments.map(serializeTaskAttachment) : [],
        timeLogs: Array.isArray(plain.timeLogs) ? plain.timeLogs.map(serializeTimeLog) : [],
        history: Array.isArray(plain.history) ? plain.history.map(serializeTaskHistoryEntry) : [],
        createdAt: plain.createdAt || null,
        updatedAt: plain.updatedAt || null
    };
}

function serializeTaskSummary(task) {
    if (!task) {
        return null;
    }

    const plain = toPlain(task);

    return {
        id: toId(plain),
        title: plain.title,
        priority: plain.priority,
        type: plain.type,
        subtaskProgress: plain.subtaskProgress || 0
    };
}

function serializeNotification(notification) {
    if (!notification) {
        return null;
    }

    const plain = toPlain(notification);

    return {
        id: toId(plain),
        type: plain.type,
        channel: plain.channel,
        title: plain.title,
        message: plain.message,
        relatedProject: plain.relatedProject ? serializeProjectSummary(plain.relatedProject) : null,
        relatedTask: plain.relatedTask ? serializeTaskSummary(plain.relatedTask) : null,
        metadata: plain.metadata || {},
        isRead: Boolean(plain.isRead),
        readAt: plain.readAt || null,
        createdAt: plain.createdAt || null
    };
}

function serializeAuditLog(auditLog) {
    if (!auditLog) {
        return null;
    }

    const plain = toPlain(auditLog);

    return {
        id: toId(plain),
        module: plain.module,
        action: plain.action,
        actor: serializeCompactUser(plain.actor),
        project: plain.project ? serializeProjectSummary(plain.project) : null,
        task: plain.task ? serializeTaskSummary(plain.task) : null,
        resourceType: plain.resourceType,
        resourceId: plain.resourceId,
        metadata: plain.metadata || {},
        createdAt: plain.createdAt || null
    };
}

module.exports = {
    serializeCompactUser,
    serializeUser,
    serializeProject,
    serializeProjectSummary,
    serializeBoard,
    serializeTask,
    serializeTaskSummary,
    serializeNotification,
    serializeAuditLog
};
