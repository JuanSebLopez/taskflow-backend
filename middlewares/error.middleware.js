const AppError = require('../utils/app-error');

function notFoundHandler(req, res, next) {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
}

function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let details = err.details || null;

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        details = Object.values(err.errors).map((item) => item.message);
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}`;
    }

    if (err.code === 11000) {
        statusCode = 409;
        message = 'A unique field already exists';
    }

    const payload = {
        message
    };

    if (details) {
        payload.details = details;
    }

    if (process.env.NODE_ENV === 'development' && err.stack) {
        payload.stack = err.stack;
    }

    res.status(statusCode).json(payload);
}

module.exports = {
    notFoundHandler,
    errorHandler
};
