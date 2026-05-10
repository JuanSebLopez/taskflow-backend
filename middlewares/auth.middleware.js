const User = require('../models/user');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const { verifyAccessToken } = require('../utils/jwt');

const protect = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
        throw new AppError('Authentication token is required', 401, null, 'AUTH_TOKEN_REQUIRED');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
        throw new AppError('User not available', 401, null, 'USER_NOT_AVAILABLE');
    }

    if (user.sessionVersion !== payload.sessionVersion) {
        throw new AppError('Session expired. Please login again.', 401, null, 'SESSION_EXPIRED');
    }

    user.lastAccessAt = new Date();
    await user.save();

    req.user = user;
    req.tokenPayload = payload;
    next();
});

const restrictTo = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return next(new AppError('You do not have permission for this action', 403, null, 'PERMISSION_DENIED'));
    }

    next();
};

module.exports = {
    protect,
    restrictTo
};
