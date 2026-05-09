const jwt = require('jsonwebtoken');
const AppError = require('./app-error');

function getJwtSecret() {
    if (!process.env.JWT_SECRET) {
        throw new AppError('JWT_SECRET is required', 500);
    }

    return process.env.JWT_SECRET;
}

function getAccessTokenTtl() {
    return process.env.ACCESS_TOKEN_TTL || '15m';
}

function getRefreshTokenTtl() {
    return process.env.REFRESH_TOKEN_TTL || '7d';
}

function signAccessToken(user) {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
            sessionVersion: user.sessionVersion,
            tokenType: 'access'
        },
        getJwtSecret(),
        { expiresIn: getAccessTokenTtl() }
    );
}

function signRefreshToken(user) {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
            sessionVersion: user.sessionVersion,
            tokenType: 'refresh'
        },
        getJwtSecret(),
        { expiresIn: getRefreshTokenTtl() }
    );
}

function verifyAccessToken(token) {
    const payload = jwt.verify(token, getJwtSecret());

    if (payload.tokenType !== 'access') {
        throw new AppError('Invalid access token', 401);
    }

    return payload;
}

function verifyRefreshToken(token) {
    const payload = jwt.verify(token, getJwtSecret());

    if (payload.tokenType !== 'refresh') {
        throw new AppError('Invalid refresh token', 401);
    }

    return payload;
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
