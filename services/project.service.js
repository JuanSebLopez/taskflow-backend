const Board = require('../models/board');
const Project = require('../models/project');
const Task = require('../models/task');
const User = require('../models/user');
const AppError = require('../utils/app-error');
const { DEFAULT_BOARD_COLUMNS } = require('../utils/constants');
const { createAuditLog } = require('./audit-log.service');
const { createNotification, notifyMany } = require('./notification.service');

function isSystemAdmin(user) {
    return user.role === 'ADMIN';
}

function isSystemProjectManager(user) {
    return user.role === 'PROJECT_MANAGER';
}

function isProjectOwner(project, user) {
    return project.owner.toString() === user._id.toString();
}

function isProjectMember(project, user) {
    return project.members.some((member) => member.user.toString() === user._id.toString());
}

function canManageProjectBoards(project, user) {
    return isSystemAdmin(user) || isProjectOwner(project, user) || (isSystemProjectManager(user) && isProjectMember(project, user));
}

function canCoordinateProjectTasks(project, user) {
    return canManageProjectBoards(project, user);
}

async function ensureProjectAccess(projectId, user) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    const isOwner = isProjectOwner(project, user);
    const isMember = isProjectMember(project, user);
    const isAdmin = isSystemAdmin(user);

    if (!isOwner && !isMember && !isAdmin) {
        throw new AppError('You do not have access to this project', 403);
    }

    return project;
}

async function ensureProjectWritable(projectId, user) {
    const project = await ensureProjectAccess(projectId, user);

    if (project.isArchived || project.status === 'ARCHIVADO') {
        throw new AppError('Archived projects are read-only', 400);
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

    await createAuditLog({
        module: 'PROJECTS',
        action: 'PROJECT_CREATED',
        actor: currentUser._id,
        project: project._id,
        resourceType: 'Project',
        resourceId: project._id.toString(),
        metadata: {
            name: project.name,
            status: project.status
        }
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
    const canEdit = isSystemAdmin(currentUser) || isProjectOwner(project, currentUser);
    const previousStatus = project.status;

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

    await createAuditLog({
        module: 'PROJECTS',
        action: project.status === 'ARCHIVADO' && previousStatus !== 'ARCHIVADO' ? 'PROJECT_ARCHIVED' : 'PROJECT_UPDATED',
        actor: currentUser._id,
        project: project._id,
        resourceType: 'Project',
        resourceId: project._id.toString(),
        metadata: { updatedFields: Object.keys(payload), previousStatus, currentStatus: project.status }
    });

    if (project.status === 'ARCHIVADO' && previousStatus !== 'ARCHIVADO') {
        const memberIds = project.members.map((member) => member.user.toString()).filter(
            (memberId) => memberId !== currentUser._id.toString()
        );

        await notifyMany(memberIds, {
            type: 'PROJECT_ARCHIVED',
            title: 'Proyecto archivado',
            message: `El proyecto "${project.name}" fue archivado`,
            relatedProject: project._id,
            metadata: { projectId: project._id.toString() }
        });
    }

    return project;
}

async function archiveProject(projectId, currentUser) {
    return updateProject(projectId, { status: 'ARCHIVADO' }, currentUser);
}

async function addProjectMember(projectId, email, currentUser) {
    const project = await ensureProjectAccess(projectId, currentUser);
    const canManageMembers = isSystemAdmin(currentUser) || isProjectOwner(project, currentUser);

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

    await createAuditLog({
        module: 'PROJECTS',
        action: 'PROJECT_MEMBER_ADDED',
        actor: currentUser._id,
        project: project._id,
        resourceType: 'Project',
        resourceId: project._id.toString(),
        metadata: {
            invitedUserId: invitedUser._id.toString(),
            invitedEmail: invitedUser.email
        }
    });
    await createNotification({
        recipient: invitedUser._id,
        type: 'PROJECT_MEMBER_ADDED',
        title: 'Invitacion a proyecto',
        message: `Ahora eres miembro del proyecto "${project.name}"`,
        relatedProject: project._id,
        metadata: {
            projectId: project._id.toString(),
            invitedBy: currentUser._id.toString()
        }
    });

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

    await createAuditLog({
        module: 'PROJECTS',
        action: 'PROJECT_CLONED',
        actor: currentUser._id,
        project: clonedProject._id,
        resourceType: 'Project',
        resourceId: clonedProject._id.toString(),
        metadata: { sourceProjectId: project._id.toString() }
    });

    return clonedProject;
}

module.exports = {
    ensureProjectAccess,
    ensureProjectWritable,
    isSystemAdmin,
    isSystemProjectManager,
    isProjectOwner,
    isProjectMember,
    canManageProjectBoards,
    canCoordinateProjectTasks,
    createProject,
    listProjectsForUser,
    updateProject,
    archiveProject,
    addProjectMember,
    cloneProject
};
