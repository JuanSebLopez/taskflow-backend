const AppError = require('../utils/app-error');

function notFoundHandler(req, res, next) {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
}

function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const payload = {
        message: err.message || 'Internal server error'
    };

    if (err.details) {
        payload.details = err.details;
    }

    if (process.env.NODE_ENV !== 'production' && err.stack) {
        payload.stack = err.stack;
    }

    res.status(statusCode).json(payload);
}

module.exports = {
    notFoundHandler,
    errorHandler
};
