const Board = require('../models/board');
const Project = require('../models/project');
const Task = require('../models/task');
const User = require('../models/user');
const AppError = require('../utils/app-error');
const { DEFAULT_BOARD_COLUMNS } = require('../utils/constants');

async function ensureProjectAccess(projectId, user) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    const isOwner = project.owner.toString() === user._id.toString();
    const isMember = project.members.some((member) => member.user.toString() === user._id.toString());
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isMember && !isAdmin) {
        throw new AppError('You do not have access to this project', 403);
    }

    return project;
}

async function createProject(payload, currentUser) {
    const project = await Project.create({
        name: payload.name,
        description: payload.description,
        startDate: payload.startDate,
        estimatedEndDate: payload.estimatedEndDate,
        owner: currentUser._id,
        members: [{ user: currentUser._id, role: 'OWNER', invitedAt: new Date() }]
    });

    await Board.create({
        name: 'Tablero Principal',
        project: project._id,
        isDefault: true,
        columns: DEFAULT_BOARD_COLUMNS
    });

    return project;
}

async function listProjectsForUser(currentUser) {
    const filter = currentUser.role === 'ADMIN'
        ? {}
        : {
              $or: [
                  { owner: currentUser._id },
                  { 'members.user': currentUser._id }
              ]
          };

    const projects = await Project.find(filter).populate('owner', 'fullName email');
    const result = [];

    for (const project of projects) {
        const tasks = await Task.find({ project: project._id });
        const doneBoard = await Board.findOne({ project: project._id, isDefault: true });
        const doneColumnIds = doneBoard
            ? doneBoard.columns
                  .filter((column) => column.title.toLowerCase().includes('complet'))
                  .map((column) => column._id.toString())
            : [];
        const total = tasks.length;
        const completed = tasks.filter((task) => doneColumnIds.includes(task.columnId.toString())).length;

        result.push({
            ...project.toObject(),
            progress: total ? Math.round((completed / total) * 100) : 0
        });
    }

    return result;
}

async function updateProject(projectId, payload, currentUser) {
    const project = await ensureProjectAccess(projectId, currentUser);
    const canEdit = currentUser.role === 'ADMIN' || project.owner.toString() === currentUser._id.toString();

    if (!canEdit) {
        throw new AppError('Only the owner or ADMIN can update this project', 403);
    }

    ['name', 'description', 'startDate', 'estimatedEndDate', 'status'].forEach((field) => {
        if (payload[field] !== undefined) {
            project[field] = payload[field];
        }
    });

    if (project.status === 'ARCHIVADO') {
        project.isArchived = true;
        project.archivedAt = new Date();
    }

    await project.save();
    return project;
}

async function archiveProject(projectId, currentUser) {
    return updateProject(projectId, { status: 'ARCHIVADO' }, currentUser);
}

async function addProjectMember(projectId, email, currentUser) {
    const project = await ensureProjectAccess(projectId, currentUser);
    const canManageMembers = currentUser.role === 'ADMIN' || project.owner.toString() === currentUser._id.toString();

    if (!canManageMembers) {
        throw new AppError('Only the owner or ADMIN can invite members', 403);
    }

    const invitedUser = await User.findOne({ email: email.toLowerCase() });

    if (!invitedUser) {
        throw new AppError('User to invite was not found', 404);
    }

    const alreadyMember = project.members.some((member) => member.user.toString() === invitedUser._id.toString());

    if (alreadyMember) {
        throw new AppError('User is already part of the project', 409);
    }

    project.members.push({ user: invitedUser._id, role: 'MEMBER', invitedAt: new Date() });
    await project.save();

    return project;
}

async function cloneProject(projectId, currentUser) {
    const project = await ensureProjectAccess(projectId, currentUser);
    const board = await Board.findOne({ project: project._id, isDefault: true });
    const clonedProject = await Project.create(project.clonePrototype(currentUser._id));

    await Board.create({
        name: board ? board.name : 'Tablero Principal',
        project: clonedProject._id,
        isDefault: true,
        columns: board ? board.columns.map((column) => ({
            title: column.title,
            order: column.order,
            wipLimit: column.wipLimit
        })) : DEFAULT_BOARD_COLUMNS
    });

    return clonedProject;
}

module.exports = {
    ensureProjectAccess,
    createProject,
    listProjectsForUser,
    updateProject,
    archiveProject,
    addProjectMember,
    cloneProject
};
