const mongoose = require('mongoose');

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(value) {
    return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidObjectId(value) {
    return mongoose.Types.ObjectId.isValid(value);
}

function isPositiveNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function collectRequiredString(body, field, label = field) {
    if (!isNonEmptyString(body[field])) {
        return `${label} is required`;
    }

    return null;
}

function collectObjectId(params, field, label = field) {
    if (!isValidObjectId(params[field])) {
        return `${label} must be a valid id`;
    }

    return null;
}

module.exports = {
    isNonEmptyString,
    isValidEmail,
    isValidObjectId,
    isPositiveNumber,
    collectRequiredString,
    collectObjectId
};
