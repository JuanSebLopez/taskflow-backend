const { createNotification, notifyMany } = require('../notification.service');
const eventTypes = require('./event-types');

class NotificationObserver {
    async handle(eventType, payload) {
        switch (eventType) {
            case eventTypes.TASK_ASSIGNEES_UPDATED:
                await notifyMany(payload.recipientIds, payload.notificationPayload);
                break;
            case eventTypes.TASK_MOVED:
                await notifyMany(payload.recipientIds, payload.notificationPayload);
                break;
            case eventTypes.TASK_COMMENTED:
                await notifyMany(payload.recipientIds, payload.notificationPayload);
                break;
            case eventTypes.PROJECT_ARCHIVED:
                await notifyMany(payload.recipientIds, payload.notificationPayload);
                break;
            case eventTypes.PROJECT_MEMBER_ADDED:
            case eventTypes.PROJECT_MEMBER_INVITED:
                await createNotification(payload.notificationPayload);
                break;
            default:
                break;
        }
    }
}

module.exports = NotificationObserver;
