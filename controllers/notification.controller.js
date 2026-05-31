const catchAsync = require('../utils/catch-async');
const { serializeNotification } = require('../serializers');
const {
    listNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    respondToProjectInvitation
} = require('../services/notification.service');

const list = catchAsync(async (req, res) => {
    const notifications = await listNotifications(req.query, req.user);
    res.json(notifications.map(serializeNotification));
});

const markRead = catchAsync(async (req, res) => {
    const notification = await markNotificationAsRead(req.params.id, req.user);
    res.json(serializeNotification(notification));
});

const markAllRead = catchAsync(async (req, res) => {
    await markAllNotificationsAsRead(req.user);
    res.json({ message: 'Notifications marked as read' });
});

const respondProjectInvitation = catchAsync(async (req, res) => {
    const notification = await respondToProjectInvitation(req.params.id, req.body.response, req.user);
    res.json({
        message: req.body.response === 'ACCEPTED' ? 'Project invitation accepted' : 'Project invitation declined',
        notification: serializeNotification(notification)
    });
});

module.exports = {
    list,
    markRead,
    markAllRead,
    respondProjectInvitation
};
