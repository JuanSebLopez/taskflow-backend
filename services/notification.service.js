const Notification = require('../models/notification');
const User = require('../models/user');
const AppError = require('../utils/app-error');
const { sendNotificationEmail, getEmailServiceStatus } = require('./email.service');

const NOTIFICATION_PREFERENCE_KEYS = {
    PROJECT_MEMBER_ADDED: 'projectMemberAdded',
    PROJECT_ARCHIVED: 'projectArchived',
    TASK_ASSIGNED: 'taskAssigned',
    TASK_MOVED: 'taskMoved',
    TASK_COMMENTED: 'taskCommented'
};

function shouldSendNotification(user, type, channel) {
    const preferenceKey = NOTIFICATION_PREFERENCE_KEYS[type];

    if (!preferenceKey) {
        return true;
    }

    return Boolean(user.notificationPreferences?.[channel]?.[preferenceKey]);
}

async function createNotification(payload) {
    const recipient = await User.findById(payload.recipient);

    if (!recipient || !recipient.isActive) {
        return null;
    }

    let createdNotification = null;

    if (shouldSendNotification(recipient, payload.type, 'inApp')) {
        createdNotification = await Notification.create({
            recipient: recipient._id,
            type: payload.type,
            channel: 'IN_APP',
            title: payload.title,
            message: payload.message,
            relatedProject: payload.relatedProject || null,
            relatedTask: payload.relatedTask || null,
            metadata: payload.metadata || {}
        });
    }

    if (shouldSendNotification(recipient, payload.type, 'email') && getEmailServiceStatus().configured) {
        try {
            await sendNotificationEmail({
                ...payload,
                recipient
            });
        } catch (error) {
            console.error('Failed to send notification email:', error.message);
        }
    }

    return createdNotification;
}

async function notifyMany(recipientIds, payload) {
    const uniqueRecipients = [...new Set((recipientIds || []).map((recipientId) => recipientId.toString()))];
    const notifications = [];

    for (const recipientId of uniqueRecipients) {
        const notification = await createNotification({
            ...payload,
            recipient: recipientId
        });

        if (notification) {
            notifications.push(notification);
        }
    }

    return notifications;
}

async function listNotifications(query, currentUser) {
    const filter = { recipient: currentUser._id };

    if (query.unreadOnly === 'true') {
        filter.isRead = false;
    }

    if (query.type) {
        filter.type = query.type;
    }

    return Notification.find(filter)
        .sort({ createdAt: -1 })
        .populate('relatedProject', 'name status')
        .populate('relatedTask', 'title type priority');
}

async function markNotificationAsRead(notificationId, currentUser) {
    const notification = await Notification.findOne({
        _id: notificationId,
        recipient: currentUser._id
    });

    if (!notification) {
        throw new AppError('Notification not found', 404);
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    return notification;
}

async function markAllNotificationsAsRead(currentUser) {
    await Notification.updateMany(
        { recipient: currentUser._id, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
    );
}

module.exports = {
    createNotification,
    notifyMany,
    listNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};
