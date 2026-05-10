const mongoose = require('mongoose');

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
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

function isValidDateInput(value) {
    return (
        (typeof value === 'string' || value instanceof Date) &&
        !Number.isNaN(new Date(value).getTime())
    );
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

function collectAllowedFields(target, allowedFields, label = 'body') {
    if (!isPlainObject(target)) {
        return [`${label} must be an object`];
    }

    const unknownFields = Object.keys(target).filter((field) => !allowedFields.includes(field));
    return unknownFields.map((field) => `${label}.${field} is not allowed`);
}

function collectRequiredAtLeastOneField(target, allowedFields, message = 'At least one field must be provided') {
    if (!isPlainObject(target)) {
        return [message];
    }

    if (Object.keys(target).length > 0) {
        return [];
    }

    const hasAnyAllowedField = allowedFields.some((field) => target[field] !== undefined);
    return hasAnyAllowedField ? [] : [message];
}

function collectValidDate(target, field, label = field) {
    if (target[field] !== undefined && !isValidDateInput(target[field])) {
        return `${label} must be a valid ISO date`;
    }

    return null;
}

function collectDateRange(startValue, endValue, startLabel, endLabel) {
    if (!isValidDateInput(startValue) || !isValidDateInput(endValue)) {
        return null;
    }

    if (new Date(startValue).getTime() > new Date(endValue).getTime()) {
        return `${startLabel} must be before or equal to ${endLabel}`;
    }

    return null;
}

module.exports = {
    isNonEmptyString,
    isPlainObject,
    isValidEmail,
    isValidObjectId,
    isPositiveNumber,
    isValidDateInput,
    collectRequiredString,
    collectObjectId,
    collectAllowedFields,
    collectRequiredAtLeastOneField,
    collectValidDate,
    collectDateRange
};
