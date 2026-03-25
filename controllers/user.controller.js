const catchAsync = require('../utils/catch-async');
const User = require('../models/user');
const { deactivateUser, updateUserRole, updateUserStatus } = require('../services/user.service');

const listUsers = catchAsync(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map((user) => user.toSafeObject()));
});

const updateRole = catchAsync(async (req, res) => {
    const user = await updateUserRole(req.params.id, req.body.role);
    res.json({
        message: 'User role updated successfully',
        user: user.toSafeObject()
    });
});

const updateStatus = catchAsync(async (req, res) => {
    const user = await updateUserStatus(req.params.id, req.body.isActive);
    res.json({
        message: 'User status updated successfully',
        user: user.toSafeObject()
    });
});

const deactivate = catchAsync(async (req, res) => {
    const user = await deactivateUser(req.params.id);
    res.json({
        message: 'User deactivated successfully',
        user: user.toSafeObject()
    });
});

module.exports = {
    listUsers,
    updateRole,
    updateStatus,
    deactivate
};