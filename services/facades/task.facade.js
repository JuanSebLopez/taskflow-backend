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
} = require('../task.service');

class TaskFacade {
    async listProjectTasks(query, currentUser) {
        return listTasks(query, currentUser);
    }

    async getTaskDetails(taskId, currentUser) {
        return getTask(taskId, currentUser);
    }

    async createTaskEntry(payload, currentUser) {
        return createTask(payload, currentUser);
    }

    async updateTaskEntry(taskId, payload, currentUser) {
        return updateTask(taskId, payload, currentUser);
    }

    async assignTaskMembersToTask(taskId, payload, currentUser) {
        return assignTaskMembers(taskId, payload, currentUser);
    }

    async addSubtaskToTask(taskId, payload, currentUser) {
        return addSubtask(taskId, payload, currentUser);
    }

    async updateSubtaskOnTask(taskId, subtaskId, payload, currentUser) {
        return updateSubtask(taskId, subtaskId, payload, currentUser);
    }

    async removeSubtaskFromTask(taskId, subtaskId, currentUser) {
        return deleteSubtask(taskId, subtaskId, currentUser);
    }

    async moveTaskToColumn(taskId, payload, currentUser) {
        return moveTask(taskId, payload, currentUser);
    }

    async cloneTaskAsTemplate(taskId, currentUser, overrides = {}) {
        return cloneTask(taskId, currentUser, overrides);
    }

    async addCommentToTask(taskId, payload, currentUser) {
        return addComment(taskId, payload, currentUser);
    }

    async updateTaskComment(taskId, commentId, payload, currentUser) {
        return updateComment(taskId, commentId, payload, currentUser);
    }

    async removeTaskComment(taskId, commentId, currentUser) {
        return deleteComment(taskId, commentId, currentUser);
    }

    async uploadTaskAttachments(taskId, files, currentUser) {
        return addAttachments(taskId, files, currentUser);
    }

    async removeTaskAttachment(taskId, attachmentId, currentUser) {
        return deleteAttachment(taskId, attachmentId, currentUser);
    }

    async addTaskTimeLog(taskId, payload, currentUser) {
        return addTimeLog(taskId, payload, currentUser);
    }
}

module.exports = new TaskFacade();
