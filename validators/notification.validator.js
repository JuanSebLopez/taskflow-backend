const { collectObjectId } = require('./common.validator');

function validateNotificationId(params) {
    const error = collectObjectId(params, 'id', 'notification id');
    return error ? [error] : [];
}

module.exports = {
    validateNotificationId
};
