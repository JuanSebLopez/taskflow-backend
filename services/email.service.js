const AppError = require('../utils/app-error');
const BrevoSmtpProvider = require('./email-providers/brevo-smtp.provider');
const NoopEmailProvider = require('./email-providers/noop-email.provider');

let cachedProvider = null;
let cachedSignature = null;

function getEmailConfig() {
    const enabled = process.env.EMAIL_ENABLED === 'true';
    const host = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
    const port = Number(process.env.BREVO_SMTP_PORT || 587);
    const secure = port === 465;
    const user = process.env.BREVO_SMTP_USER || '';
    const password = process.env.BREVO_SMTP_PASS || '';
    const fromEmail = process.env.MAIL_FROM_EMAIL || '';
    const fromName = process.env.MAIL_FROM_NAME || 'TaskFlow';
    const replyTo = process.env.MAIL_REPLY_TO || '';
    const configured = Boolean(enabled && user && password && fromEmail);

    return {
        enabled,
        configured,
        host,
        port,
        secure,
        user,
        password,
        fromEmail,
        fromName,
        replyTo
    };
}

function getEmailServiceStatus() {
    const config = getEmailConfig();

    return {
        provider: 'BREVO_SMTP',
        enabled: config.enabled,
        configured: config.configured,
        host: config.host,
        port: config.port,
        fromEmail: config.fromEmail || null,
        fromName: config.fromName
    };
}

function resolveProvider() {
    const config = getEmailConfig();
    const signature = JSON.stringify({
        enabled: config.enabled,
        host: config.host,
        port: config.port,
        user: config.user,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
        replyTo: config.replyTo
    });

    if (cachedProvider && cachedSignature === signature) {
        return cachedProvider;
    }

    cachedSignature = signature;
    cachedProvider = config.configured ? new BrevoSmtpProvider(config) : new NoopEmailProvider();
    return cachedProvider;
}

function ensureEmailConfigured() {
    const status = getEmailServiceStatus();

    if (!status.enabled) {
        throw new AppError('Email delivery is disabled', 400);
    }

    if (!status.configured) {
        throw new AppError('Email service is not fully configured', 400);
    }
}

function buildNotificationEmail(payload) {
    const projectName = payload.relatedProject?.name || 'TaskFlow';
    const taskName = payload.relatedTask?.title || '';
    const subjectMap = {
        PROJECT_MEMBER_ADDED: `Invitacion a proyecto: ${projectName}`,
        PROJECT_ARCHIVED: `Proyecto archivado: ${projectName}`,
        TASK_ASSIGNED: `Nueva asignacion: ${taskName}`,
        TASK_MOVED: `Cambio de estado: ${taskName}`,
        TASK_COMMENTED: `Nuevo comentario: ${taskName}`
    };

    const subject = subjectMap[payload.type] || payload.title;
    const text = `${payload.title}\n\n${payload.message}\n\nProyecto: ${projectName}${taskName ? `\nTarea: ${taskName}` : ''}`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #0f172a;">
            <h2 style="margin-bottom: 8px;">${payload.title}</h2>
            <p style="margin: 0 0 12px 0;">${payload.message}</p>
            <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <p style="margin: 0 0 6px 0;"><strong>Proyecto:</strong> ${projectName}</p>
                ${taskName ? `<p style="margin: 0;"><strong>Tarea:</strong> ${taskName}</p>` : ''}
            </div>
        </div>
    `;

    return { subject, text, html };
}

async function sendEmail(payload) {
    ensureEmailConfigured();
    const provider = resolveProvider();
    return provider.send(payload);
}

async function sendNotificationEmail(payload) {
    const { subject, text, html } = buildNotificationEmail(payload);

    return sendEmail({
        to: {
            name: payload.recipient.fullName || undefined,
            address: payload.recipient.email
        },
        subject,
        text,
        html
    });
}

async function sendTestEmail(target) {
    ensureEmailConfigured();

    return sendEmail({
        to: {
            name: target.fullName || undefined,
            address: target.email
        },
        subject: 'Prueba de correo TaskFlow',
        text: 'Este es un correo de prueba enviado desde TaskFlow usando Brevo SMTP.',
        html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a;">
                <h2>Prueba de correo TaskFlow</h2>
                <p>Este es un correo de prueba enviado desde TaskFlow usando Brevo SMTP.</p>
            </div>
        `
    });
}

async function sendVerificationEmail(target) {
    ensureEmailConfigured();

    const verificationUrl = process.env.FRONTEND_VERIFY_EMAIL_URL
        ? `${process.env.FRONTEND_VERIFY_EMAIL_URL}?email=${encodeURIComponent(target.email)}&token=${encodeURIComponent(target.token)}`
        : null;

    const text = verificationUrl
        ? `Bienvenido a TaskFlow.\n\nVerifica tu cuenta con este enlace:\n${verificationUrl}\n\nSi prefieres hacerlo manualmente, usa este token:\n${target.token}`
        : `Bienvenido a TaskFlow.\n\nUsa este token para verificar tu cuenta:\n${target.token}`;

    const html = `
        <div style="font-family: Arial, sans-serif; color: #0f172a;">
            <h2>Verifica tu cuenta</h2>
            <p>Bienvenido a TaskFlow. Para activar tu cuenta, usa el siguiente token:</p>
            <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-family: monospace; font-size: 16px;">
                ${target.token}
            </div>
            ${verificationUrl ? `<p style="margin-top: 16px;">Tambien puedes verificar tu cuenta desde este enlace:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>` : ''}
            <p style="margin-top: 16px;">Este token vence en 1 hora.</p>
        </div>
    `;

    return sendEmail({
        to: {
            name: target.fullName || undefined,
            address: target.email
        },
        subject: 'Verifica tu cuenta de TaskFlow',
        text,
        html
    });
}

module.exports = {
    getEmailServiceStatus,
    sendNotificationEmail,
    sendTestEmail,
    sendVerificationEmail
};
