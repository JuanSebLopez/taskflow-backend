const catchAsync = require('../utils/catch-async');
const { serializeAuditLog } = require('../serializers');
const { listAuditLogs } = require('../services/audit-log.service');

const list = catchAsync(async (req, res) => {
    const auditLogs = await listAuditLogs(req.query, req.user);
    res.json(auditLogs.map(serializeAuditLog));
});

module.exports = {
    list
};
