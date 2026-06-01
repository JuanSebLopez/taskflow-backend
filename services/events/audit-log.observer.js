const { createAuditLog } = require('../audit-log.service');
const eventTypes = require('./event-types');

class AuditLogObserver {
    async handle(eventType, payload) {
        switch (eventType) {
            case eventTypes.TASK_CREATED:
            case eventTypes.TASK_UPDATED:
            case eventTypes.TASK_ASSIGNEES_UPDATED:
            case eventTypes.TASK_MOVED:
            case eventTypes.TASK_COMMENTED:
            case eventTypes.TASK_COMMENT_UPDATED:
            case eventTypes.TASK_COMMENT_DELETED:
            case eventTypes.TASK_CLONED:
            case eventTypes.TASK_ATTACHMENT_ADDED:
            case eventTypes.TASK_ATTACHMENT_DELETED:
            case eventTypes.TASK_SUBTASK_ADDED:
            case eventTypes.TASK_SUBTASK_UPDATED:
            case eventTypes.TASK_SUBTASK_DELETED:
            case eventTypes.TASK_TIME_LOG_ADDED:
            case eventTypes.PROJECT_CREATED:
            case eventTypes.PROJECT_UPDATED:
            case eventTypes.PROJECT_ARCHIVED:
            case eventTypes.PROJECT_MEMBER_ADDED:
            case eventTypes.PROJECT_MEMBER_INVITED:
            case eventTypes.PROJECT_MEMBER_INVITATION_ACCEPTED:
            case eventTypes.PROJECT_MEMBER_INVITATION_DECLINED:
            case eventTypes.PROJECT_MEMBER_ROLE_UPDATED:
            case eventTypes.PROJECT_MEMBER_REMOVED:
            case eventTypes.PROJECT_CLONED:
            case eventTypes.PROJECT_DELETED:
            case eventTypes.TASK_FILTER_SAVED:
            case eventTypes.TASK_FILTER_DELETED:
            case eventTypes.SYSTEM_SETTINGS_UPDATED:
                if (!payload.auditLogEntry) {
                    return;
                }

                await createAuditLog(payload.auditLogEntry);
                break;
            default:
                break;
        }
    }
}

module.exports = AuditLogObserver;
