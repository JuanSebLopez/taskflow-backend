const { NOTIFICATION_TYPES } = require('../utils/constants');
const { collectAllowedFields, collectObjectId, collectRequiredAtLeastOneField } = require('./common.validator');

function validateNotificationId(params) {
    const error = collectObjectId(params, 'id', 'notification id');
    return error ? [error] : [];
}

function validateNotificationListQuery(query) {
    const errors = collectAllowedFields(query, ['unreadOnly', 'type'], 'query');

    if (query.unreadOnly !== undefined && !['true', 'false'].includes(String(query.unreadOnly))) {
        errors.push('unreadOnly must be true or false');
    }

    if (query.type && !NOTIFICATION_TYPES.includes(query.type)) {
        errors.push(`type must be one of: ${NOTIFICATION_TYPES.join(', ')}`);
    }

    return errors;
}

function validateProjectInvitationResponse(body) {
    const errors = [
        ...collectAllowedFields(body, ['response']),
        ...collectRequiredAtLeastOneField(body, ['response'], 'response is required')
    ];

    if (body.response !== undefined && !['ACCEPTED', 'DECLINED'].includes(body.response)) {
        errors.push('response must be ACCEPTED or DECLINED');
    }

    return errors;
}

module.exports = {
    validateNotificationId,
    validateNotificationListQuery,
    validateProjectInvitationResponse
};
