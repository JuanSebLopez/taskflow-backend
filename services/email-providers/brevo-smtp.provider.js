const nodemailer = require('nodemailer');
const BaseEmailProvider = require('./base-email.provider');

class BrevoSmtpProvider extends BaseEmailProvider {
    constructor(config) {
        super();
        this.config = config;
        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.password
            }
        });
    }

    async send(payload) {
        return this.transporter.sendMail({
            from: {
                name: payload.fromName || this.config.fromName,
                address: payload.fromEmail || this.config.fromEmail
            },
            to: payload.to,
            replyTo: payload.replyTo || this.config.replyTo || undefined,
            subject: payload.subject,
            text: payload.text,
            html: payload.html
        });
    }
}

module.exports = BrevoSmtpProvider;
