const jwt = require('jsonwebtoken');
const AppError = require('./app-error');

function getJwtSecret() {
    if (!process.env.JWT_SECRET) {
        throw new AppError('JWT_SECRET is required', 500);
    }

    return process.env.JWT_SECRET;
}

function signAccessToken(user) {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
            sessionVersion: user.sessionVersion
        },
        getJwtSecret(),
        { expiresIn: '1d' }
    );
}

function verifyAccessToken(token) {
    return jwt.verify(token, getJwtSecret());
}

module.exports = {
    signAccessToken,
    verifyAccessToken
};
