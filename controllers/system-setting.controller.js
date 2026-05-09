const catchAsync = require('../utils/catch-async');
const { serializePublicSystemSetting, serializeSystemSetting } = require('../serializers');
const {
    getPublicSystemSettings,
    getSystemSettings,
    updateSystemSettings
} = require('../services/system-setting.service');
const { sendTestEmail } = require('../services/email.service');

const getPublic = catchAsync(async (req, res) => {
    const settings = await getPublicSystemSettings();
    res.json(serializePublicSystemSetting(settings));
});

const getAdmin = catchAsync(async (req, res) => {
    const settings = await getSystemSettings();
    res.json(serializeSystemSetting(settings));
});

const update = catchAsync(async (req, res) => {
    const settings = await updateSystemSettings(req.body, req.user);
    res.json({
        message: 'System settings updated successfully',
        settings: serializeSystemSetting(settings)
    });
});

const sendEmailTest = catchAsync(async (req, res) => {
    const target = {
        email: req.body.email || req.user.email,
        fullName: req.body.fullName || req.user.fullName
    };

    await sendTestEmail(target);

    res.json({
        message: 'Test email sent successfully',
        target: {
            email: target.email,
            fullName: target.fullName || ''
        }
    });
});

module.exports = {
    getPublic,
    getAdmin,
    update,
    sendEmailTest
};
