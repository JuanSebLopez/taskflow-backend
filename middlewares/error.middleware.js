const AppError = require('../utils/app-error');

function notFoundHandler(req, res, next) {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, null, 'ROUTE_NOT_FOUND'));
}

function defaultCodeForStatus(statusCode) {
    switch (statusCode) {
    case 400:
        return 'BAD_REQUEST';
    case 401:
        return 'UNAUTHORIZED';
    case 403:
        return 'FORBIDDEN';
    case 404:
        return 'NOT_FOUND';
    case 409:
        return 'CONFLICT';
    default:
        return 'INTERNAL_SERVER_ERROR';
    }
}

function normalizeError(err) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let details = err.details || null;
    let code = err.code || defaultCodeForStatus(statusCode);
    let isOperational = Boolean(err.isOperational);

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        details = Object.values(err.errors).map((item) => item.message);
        code = 'VALIDATION_ERROR';
        isOperational = true;
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}`;
        details = null;
        code = 'INVALID_IDENTIFIER';
        isOperational = true;
    }

    if (err.code === 11000) {
        statusCode = 409;
        message = 'A unique field already exists';
        details = Object.keys(err.keyPattern || {});
        code = 'DUPLICATE_RESOURCE';
        isOperational = true;
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token has expired';
        details = null;
        code = 'TOKEN_EXPIRED';
        isOperational = true;
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
        statusCode = 401;
        message = 'Authentication token is invalid';
        details = null;
        code = 'INVALID_TOKEN';
        isOperational = true;
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'Request body contains invalid JSON';
        details = null;
        code = 'INVALID_JSON';
        isOperational = true;
    }

    return {
        statusCode,
        message,
        details,
        code,
        isOperational
    };
}

function errorHandler(err, req, res, next) {
    const normalized = normalizeError(err);
    const isDev = process.env.NODE_ENV === 'development';
    const exposeMessage = normalized.isOperational || isDev;

    const payload = {
        success: false,
        message: exposeMessage ? normalized.message : 'Internal server error',
        code: normalized.code,
        statusCode: normalized.statusCode,
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    };

    if (normalized.details && (normalized.isOperational || isDev)) {
        payload.details = normalized.details;
    }

    if (isDev && err.stack) {
        payload.stack = err.stack;
    }

    if (!normalized.isOperational) {
        console.error('Unhandled error:', err);
    }

    res.status(normalized.statusCode).json(payload);
}

module.exports = {
    notFoundHandler,
    errorHandler
};
