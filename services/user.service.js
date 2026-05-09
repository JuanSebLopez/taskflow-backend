const bcrypt = require('bcryptjs');
const User = require('../models/user');
const AppError = require('../utils/app-error');
const { APP_THEMES, USER_ROLES } = require('../utils/constants');
const { generateVerificationToken, hashToken } = require('../utils/verification-token');
const { sendVerificationEmail } = require('./email.service');

async function registerUser(payload) {
    const existingUser = await User.findOne({ email: payload.email.toLowerCase() });

    if (existingUser) {
        throw new AppError('Email already registered', 409);
    }

    const password = await bcrypt.hash(payload.password, 10);
    const verification = generateVerificationToken();
    const user = await User.create({
        fullName: payload.fullName,
        email: payload.email.toLowerCase(),
        password,
        role: 'DEVELOPER',
        emailVerificationTokenHash: verification.tokenHash,
        emailVerificationExpiresAt: verification.expiresAt
    });

    await sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        token: verification.token
    });

    return user;
}

async function authenticateUser(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.isActive) {
        throw new AppError('Invalid credentials', 401);
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
        throw new AppError('Invalid credentials', 401);
    }

    if (!user.isEmailVerified) {
        throw new AppError('Email verification is required before login', 403);
    }

    user.lastAccessAt = new Date();
    await user.save();
    return user;
}

async function verifyUserEmail(email, token) {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.isEmailVerified) {
        return user;
    }

    if (!user.emailVerificationTokenHash || !user.emailVerificationExpiresAt) {
        throw new AppError('Email verification token is not available', 400);
    }

    if (user.emailVerificationExpiresAt < new Date()) {
        throw new AppError('Email verification token has expired', 400);
    }

    if (user.emailVerificationTokenHash !== hashToken(token)) {
        throw new AppError('Email verification token is invalid', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    return user;
}

async function resendVerificationEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.isEmailVerified) {
        throw new AppError('Email is already verified', 409);
    }

    const verification = generateVerificationToken();
    user.emailVerificationTokenHash = verification.tokenHash;
    user.emailVerificationExpiresAt = verification.expiresAt;
    await user.save();

    await sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        token: verification.token
    });
}

async function updateProfile(userId, payload) {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (payload.fullName !== undefined) {
        user.fullName = payload.fullName;
    }

    if (payload.avatarUrl !== undefined) {
        user.avatarUrl = payload.avatarUrl;
    }

    if (payload.bio !== undefined) {
        user.bio = payload.bio;
    }

    if (payload.theme !== undefined) {
        if (!APP_THEMES.includes(payload.theme)) {
            throw new AppError(`theme must be one of: ${APP_THEMES.join(', ')}`, 400);
        }

        user.theme = payload.theme;
    }

    if (payload.notificationPreferences !== undefined) {
        const nextPreferences = {
            inApp: {
                ...user.notificationPreferences?.inApp?.toObject?.(),
                ...(user.notificationPreferences?.inApp || {}),
                ...(payload.notificationPreferences.inApp || {})
            },
            email: {
                ...user.notificationPreferences?.email?.toObject?.(),
                ...(user.notificationPreferences?.email || {}),
                ...(payload.notificationPreferences.email || {})
            }
        };

        user.notificationPreferences = nextPreferences;
    }

    await user.save();
    return user;
}

async function logoutUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    user.sessionVersion += 1;
    await user.save();
}

async function updateUserStatus(userId, isActive) {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    user.isActive = isActive;

    if (!isActive) {
        user.sessionVersion += 1;
    }

    await user.save();
    return user;
}

async function deactivateUser(userId) {
    return updateUserStatus(userId, false);
}

async function updateUserRole(userId, role) {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (!USER_ROLES.includes(role)) {
        throw new AppError(`role must be one of: ${USER_ROLES.join(', ')}`, 400);
    }

    user.role = role;
    await user.save();
    return user;
}

module.exports = {
    registerUser,
    authenticateUser,
    verifyUserEmail,
    resendVerificationEmail,
    updateProfile,
    logoutUser,
    deactivateUser,
    updateUserRole,
    updateUserStatus
};
