const catchAsync = require('../utils/catch-async');
const { serializeNotification } = require('../serializers');
const {
    listNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
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

module.exports = {
    list,
    markRead,
    markAllRead
};
