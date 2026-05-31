const eventBus = require('./event-bus');
const AuditLogObserver = require('./audit-log.observer');
const NotificationObserver = require('./notification.observer');
const EmailObserver = require('./email.observer');
const eventTypes = require('./event-types');

function registerObservers() {
    const auditLogObserver = new AuditLogObserver();
    const notificationObserver = new NotificationObserver();
    const emailObserver = new EmailObserver();

    Object.values(eventTypes).forEach((eventType) => {
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
            case eventTypes.PROJECT_CLONED:
            case eventTypes.PROJECT_DELETED:
            case eventTypes.TASK_FILTER_SAVED:
            case eventTypes.TASK_FILTER_DELETED:
            case eventTypes.SYSTEM_SETTINGS_UPDATED:
                eventBus.subscribe(eventType, auditLogObserver);
                break;
            default:
                break;
        }
    });

    eventBus.subscribe(eventTypes.TASK_ASSIGNEES_UPDATED, notificationObserver);
    eventBus.subscribe(eventTypes.TASK_MOVED, notificationObserver);
    eventBus.subscribe(eventTypes.TASK_COMMENTED, notificationObserver);
    eventBus.subscribe(eventTypes.PROJECT_ARCHIVED, notificationObserver);
    eventBus.subscribe(eventTypes.PROJECT_MEMBER_ADDED, notificationObserver);

    eventBus.subscribe(eventTypes.VERIFICATION_EMAIL_SENT, emailObserver);
    eventBus.subscribe(eventTypes.VERIFICATION_EMAIL_REREQUESTED, emailObserver);
    eventBus.subscribe(eventTypes.NOTIFICATION_EMAIL_REQUESTED, emailObserver);
}

module.exports = {
    registerObservers
};
