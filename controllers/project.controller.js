const catchAsync = require('../utils/catch-async');
const { serializeProject, serializeProjectListItem, serializeProjectMutation } = require('../serializers');
const projectFacade = require('../services/facades/project.facade');

const create = catchAsync(async (req, res) => {
    const project = await projectFacade.createProjectWorkspace(req.body, req.user);
    res.status(201).json({
        message: 'Project created successfully',
        project: serializeProjectMutation(project)
    });
});

const list = catchAsync(async (req, res) => {
    const projects = await projectFacade.listAccessibleProjects(req.user);
    res.json(projects.map(serializeProjectListItem));
});

const getById = catchAsync(async (req, res) => {
    const project = await projectFacade.getProjectDetails(req.params.id, req.user);
    res.json(serializeProject(project));
});

const update = catchAsync(async (req, res) => {
    const project = await projectFacade.updateProjectDetails(req.params.id, req.body, req.user);
    res.json({
        message: 'Project updated successfully',
        project: serializeProjectMutation(project)
    });
});

const remove = catchAsync(async (req, res) => {
    await projectFacade.deleteProjectWorkspace(req.params.id, req.user);
    res.json({ message: 'Project deleted successfully' });
});

const addMember = catchAsync(async (req, res) => {
    const project = await projectFacade.addMemberToProject(req.params.id, req.body.email, req.user);
    res.json({
        message: 'Project member added successfully',
        project: serializeProjectMutation(project)
    });
});

const archive = catchAsync(async (req, res) => {
    const project = await projectFacade.archiveProjectWorkspace(req.params.id, req.user);
    res.json({
        message: 'Project archived successfully',
        project: serializeProjectMutation(project)
    });
});

const clone = catchAsync(async (req, res) => {
    const project = await projectFacade.cloneProjectWorkspace(req.params.id, req.user);
    res.status(201).json({
        message: 'Project cloned successfully',
        project: serializeProjectMutation(project)
    });
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
