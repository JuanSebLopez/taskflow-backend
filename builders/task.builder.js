class TaskBuilder {
    constructor(payload = {}) {
        this.task = {
            title: payload.title,
            description: payload.description || '',
            priority: payload.priority,
            type: payload.type,
            dueDate: payload.dueDate || null,
            estimatedHours: payload.estimatedHours || 0,
            project: payload.project,
            board: payload.board,
            columnId: payload.columnId,
            createdBy: payload.createdBy,
            assignees: Array.isArray(payload.assignees) ? payload.assignees : [],
            labels: Array.isArray(payload.labels) ? payload.labels : [],
            subtasks: Array.isArray(payload.subtasks) ? payload.subtasks : []
        };
    }

    withLabels(labels = []) {
        this.task.labels = labels.map((label) => ({
            name: label.name,
            color: label.color || '#6b7280'
        }));
        return this;
    }

    withSubtasks(subtasks = []) {
        this.task.subtasks = subtasks.map((subtask) => ({
            title: subtask.title,
            isCompleted: Boolean(subtask.isCompleted)
        }));
        return this;
    }

    withAssignees(assignees = []) {
        this.task.assignees = assignees;
        return this;
    }

    build() {
        return { ...this.task };
    }
}

module.exports = TaskBuilder;
