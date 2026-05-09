class BaseEmailProvider {
    async send() {
        throw new Error('send() must be implemented by subclasses');
    }
}

module.exports = BaseEmailProvider;
