const crypto = require('crypto');

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function generateVerificationToken() {
    const token = crypto.randomBytes(24).toString('hex');

    return {
        token,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60)
    };
}

module.exports = {
    hashToken,
    generateVerificationToken
};
