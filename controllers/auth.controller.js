const catchAsync = require('../utils/catch-async');
const { serializeUser } = require('../serializers');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { authenticateUser, registerUser, verifyUserEmail, resendVerificationEmail, logoutUser, updateProfile } = require('../services/user.service');
const User = require('../models/user');
const AppError = require('../utils/app-error');

const register = catchAsync(async (req, res) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        message: 'User registered successfully. Please verify your email before login.',
        user: serializeUser(user)
    });
});

const login = catchAsync(async (req, res) => {
    const user = await authenticateUser(req.body.email, req.body.password);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: serializeUser(user)
    });
});

const verifyEmail = catchAsync(async (req, res) => {
    const user = await verifyUserEmail(req.body.email, req.body.token);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({
        message: 'Email verified successfully',
        accessToken,
        refreshToken,
        user: serializeUser(user)
    });
});

const resendVerification = catchAsync(async (req, res) => {
    await resendVerificationEmail(req.body.email);
    res.json({ message: 'Verification email sent successfully' });
});

const refresh = catchAsync(async (req, res) => {
    const payload = verifyRefreshToken(req.body.refreshToken);
    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
        throw new AppError('User not available', 401);
    }

    if (!user.isEmailVerified) {
        throw new AppError('Email verification is required before refreshing session', 403);
    }

    if (user.sessionVersion !== payload.sessionVersion) {
        throw new AppError('Session expired. Please login again.', 401);
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({
        message: 'Session refreshed successfully',
        accessToken,
        refreshToken,
        user: serializeUser(user)
    });
});

const logout = catchAsync(async (req, res) => {
    await logoutUser(req.user._id);
    res.json({ message: 'Logout successful' });
});

const me = (req, res) => {
    res.json(serializeUser(req.user));
};

const updateMe = catchAsync(async (req, res) => {
    const user = await updateProfile(req.user._id, req.body);
    res.json({
        message: 'Profile updated successfully',
        user: serializeUser(user)
    });
});

module.exports = {
    register,
    login,
    verifyEmail,
    resendVerification,
    refresh,
    logout,
    me,
    updateMe
};
