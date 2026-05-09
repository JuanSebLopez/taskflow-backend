const catchAsync = require('../utils/catch-async');
const { serializePublicSystemSetting, serializeSystemSetting } = require('../serializers');
const {
    getPublicSystemSettings,
    getSystemSettings,
    updateSystemSettings
} = require('../services/system-setting.service');

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

module.exports = {
    getPublic,
    getAdmin,
    update
};
