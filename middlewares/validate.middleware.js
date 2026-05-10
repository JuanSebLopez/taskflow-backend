const AppError = require('../utils/app-error');

function validate(schema) {
    return (req, res, next) => {
        const errors = [];

        if (schema.body) {
            errors.push(...schema.body(req.body || {}, req));
        }

        if (schema.params) {
            errors.push(...schema.params(req.params || {}, req));
        }

        if (schema.query) {
            errors.push(...schema.query(req.query || {}, req));
        }

        if (errors.length) {
            return next(new AppError('Validation failed', 400, errors, 'VALIDATION_ERROR'));
        }

        next();
    };
}

module.exports = validate;
