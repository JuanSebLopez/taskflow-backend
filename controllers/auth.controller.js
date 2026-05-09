const catchAsync = require('../utils/catch-async');
const { serializeUser } = require('../serializers');
const { signAccessToken } = require('../utils/jwt');
const { authenticateUser, registerUser, logoutUser, updateProfile } = require('../services/user.service');

const register = catchAsync(async (req, res) => {
    const user = await registerUser(req.body);
    const token = signAccessToken(user);

    res.status(201).json({
        message: 'User registered successfully',
        token,
        user: serializeUser(user)
    });
});

const login = catchAsync(async (req, res) => {
    const user = await authenticateUser(req.body.email, req.body.password);
    const token = signAccessToken(user);

    res.json({
        message: 'Login successful',
        token,
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
    logout,
    me,
    updateMe
};
