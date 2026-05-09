const catchAsync = require('../utils/catch-async');
const User = require('../models/user');
const { serializeUser } = require('../serializers');
const { deactivateUser, updateUserRole, updateUserStatus } = require('../services/user.service');

const listUsers = catchAsync(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(serializeUser));
});

const updateRole = catchAsync(async (req, res) => {
    const user = await updateUserRole(req.params.id, req.body.role);
    res.json({
        message: 'User role updated successfully',
        user: serializeUser(user)
    });
});

const updateStatus = catchAsync(async (req, res) => {
    const user = await updateUserStatus(req.params.id, req.body.isActive);
    res.json({
        message: 'User status updated successfully',
        user: serializeUser(user)
    });
});

const deactivate = catchAsync(async (req, res) => {
    const user = await deactivateUser(req.params.id);
    res.json({
        message: 'User deactivated successfully',
        user: serializeUser(user)
    });
});

module.exports = {
    listUsers,
    updateRole,
    updateStatus,
    deactivate
};
