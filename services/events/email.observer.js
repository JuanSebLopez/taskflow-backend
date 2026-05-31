const { sendVerificationEmail, sendNotificationEmail } = require('../email.service');
const eventTypes = require('./event-types');

class EmailObserver {
    async handle(eventType, payload) {
        switch (eventType) {
            case eventTypes.VERIFICATION_EMAIL_SENT:
            case eventTypes.VERIFICATION_EMAIL_REREQUESTED:
                await sendVerificationEmail(payload.emailPayload);
                break;
            case eventTypes.NOTIFICATION_EMAIL_REQUESTED:
                await sendNotificationEmail(payload.emailPayload);
                break;
            default:
                break;
        }
    }
}

module.exports = EmailObserver;
