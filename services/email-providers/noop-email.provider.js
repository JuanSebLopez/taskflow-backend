const BaseEmailProvider = require('./base-email.provider');

class NoopEmailProvider extends BaseEmailProvider {
    async send() {
        return {
            accepted: [],
            rejected: [],
            messageId: 'noop'
        };
    }
}

module.exports = NoopEmailProvider;
