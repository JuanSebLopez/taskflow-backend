const catchAsync = require('../utils/catch-async');
const Board = require('../models/board');
const Project = require('../models/project');
const Task = require('../models/task');
const AppError = require('../utils/app-error');
const { serializeProject } = require('../serializers');
const {
    addProjectMember,
    archiveProject,
    cloneProject,
    createProject,
    ensureProjectAccess,
    listProjectsForUser,
    updateProject
} = require('../services/project.service');

const create = catchAsync(async (req, res) => {
    const project = await createProject(req.body, req.user);
    res.status(201).json(serializeProject(project));
});

const list = catchAsync(async (req, res) => {
    const projects = await listProjectsForUser(req.user);
    res.json(projects.map(serializeProject));
});

const getById = catchAsync(async (req, res) => {
    const project = await ensureProjectAccess(req.params.id, req.user);
    res.json(serializeProject(project));
});

const update = catchAsync(async (req, res) => {
    const project = await updateProject(req.params.id, req.body, req.user);
    res.json(serializeProject(project));
});

const remove = catchAsync(async (req, res) => {
    const project = await ensureProjectAccess(req.params.id, req.user);
    const canDelete = req.user.role === 'ADMIN' || project.owner.toString() === req.user._id.toString();

    if (!canDelete) {
        throw new AppError('Only the owner or ADMIN can delete the project', 403);
    }

    await Task.deleteMany({ project: project._id });
    await Board.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);
    res.json({ message: 'Project deleted successfully' });
});

const addMember = catchAsync(async (req, res) => {
    const project = await addProjectMember(req.params.id, req.body.email, req.user);
    res.json(serializeProject(project));
});

const archive = catchAsync(async (req, res) => {
    const project = await archiveProject(req.params.id, req.user);
    res.json(serializeProject(project));
});

const clone = catchAsync(async (req, res) => {
    const project = await cloneProject(req.params.id, req.user);
    res.status(201).json(serializeProject(project));
});

module.exports = {
    create,
    list,
    getById,
    update,
    remove,
    addMember,
    archive,
    clone
};
