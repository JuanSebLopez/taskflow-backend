const Notification = require('../models/notification');
const Project = require('../models/project');
const User = require('../models/user');
const AppError = require('../utils/app-error');
const eventBus = require('./events/event-bus');
const eventTypes = require('./events/event-types');
const { getEmailServiceStatus } = require('./email.service');

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

    if (payload.forceInApp || shouldSendNotification(recipient, payload.type, 'inApp')) {
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
        await eventBus.publish(eventTypes.NOTIFICATION_EMAIL_REQUESTED, {
            emailPayload: {
                ...payload,
                recipient
            }
        });
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

async function respondToProjectInvitation(notificationId, response, currentUser) {
    const notification = await Notification.findOne({
        _id: notificationId,
        recipient: currentUser._id,
        type: 'PROJECT_MEMBER_ADDED',
        'metadata.invitationStatus': 'PENDING'
    });

    if (!notification) {
        throw new AppError('Pending project invitation not found', 404);
    }

    const project = await Project.findById(notification.relatedProject);

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    if (response === 'ACCEPTED' && (project.isArchived || project.status === 'ARCHIVADO')) {
        throw new AppError('Archived projects are read-only', 400);
    }

    const alreadyMember = project.members.some((member) => member.user.toString() === currentUser._id.toString());
    const invitationStatus = response === 'ACCEPTED' ? 'ACCEPTED' : 'DECLINED';

    if (response === 'ACCEPTED' && !alreadyMember) {
        project.members.push({ user: currentUser._id, role: 'MEMBER', invitedAt: new Date() });
        await project.save();
    }

    notification.metadata = {
        ...(notification.metadata || {}),
        invitationStatus,
        respondedAt: new Date().toISOString()
    };
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    await eventBus.publish(
        response === 'ACCEPTED'
            ? eventTypes.PROJECT_MEMBER_INVITATION_ACCEPTED
            : eventTypes.PROJECT_MEMBER_INVITATION_DECLINED,
        {
            auditLogEntry: {
                module: 'PROJECTS',
                action: response === 'ACCEPTED'
                    ? 'PROJECT_MEMBER_INVITATION_ACCEPTED'
                    : 'PROJECT_MEMBER_INVITATION_DECLINED',
                actor: currentUser._id,
                project: project._id,
                resourceType: 'Project',
                resourceId: project._id.toString(),
                metadata: {
                    invitationNotificationId: notification._id.toString(),
                    userId: currentUser._id.toString()
                }
            }
        }
    );

    return notification.populate('relatedProject', 'name status');
}

module.exports = {
    createNotification,
    notifyMany,
    listNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    respondToProjectInvitation
};
