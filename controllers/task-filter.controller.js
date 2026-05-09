const catchAsync = require('../utils/catch-async');
const { serializeSavedTaskFilter } = require('../serializers');
const {
    createSavedTaskFilter,
    listSavedTaskFilters,
    deleteSavedTaskFilter
} = require('../services/task-filter.service');

const list = catchAsync(async (req, res) => {
    const filters = await listSavedTaskFilters(req.query.projectId, req.user);
    res.json(filters.map(serializeSavedTaskFilter));
});

const create = catchAsync(async (req, res) => {
    const filter = await createSavedTaskFilter(req.body, req.user);
    res.status(201).json(serializeSavedTaskFilter(filter));
});

const remove = catchAsync(async (req, res) => {
    await deleteSavedTaskFilter(req.params.id, req.user);
    res.json({ message: 'Saved filter deleted successfully' });
});

module.exports = {
    list,
    create,
    remove
};
