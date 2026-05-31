const Board = require('../models/board');
const Notification = require('../models/notification');
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

function getProjectMembership(project, user) {
    return project.members.find((member) => member.user.toString() === user._id.toString());
}

function getProjectMemberRole(project, user) {
    if (isProjectOwner(project, user)) {
        return 'OWNER';
    }

    return getProjectMembership(project, user)?.role || null;
}

function canManageProjectMembers(project, user) {
    return isSystemAdmin(user) || isProjectOwner(project, user);
}

function canManageProjectBoards(project, user) {
    const projectRole = getProjectMemberRole(project, user);
    return isSystemAdmin(user)
        || projectRole === 'OWNER'
        || projectRole === 'MANAGER'
        || (isSystemProjectManager(user) && isProjectMember(project, user));
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

async function calculateProjectProgress(projectId) {
    const [tasks, boards] = await Promise.all([
        Task.find({ project: projectId }).select('columnId'),
        Board.find({ project: projectId }).select('columns')
    ]);

    const completedColumnIds = new Set();
    boards.forEach((board) => {
        board.columns
            .filter((column) => column.title.toLowerCase().includes('complet'))
            .forEach((column) => completedColumnIds.add(column._id.toString()));
    });

    const total = tasks.length;
    const completed = tasks.filter((task) => completedColumnIds.has(task.columnId.toString())).length;

    return total ? Math.round((completed / total) * 100) : 0;
}

async function attachProjectProgress(project) {
    return {
        ...project.toObject(),
        progress: await calculateProjectProgress(project._id)
    };
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
        result.push(await attachProjectProgress(project));
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
    const project = await ensureProjectWritable(projectId, currentUser);

    if (!canManageProjectMembers(project, currentUser)) {
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

    const pendingInvitation = await Notification.findOne({
        recipient: invitedUser._id,
        type: 'PROJECT_MEMBER_ADDED',
        relatedProject: project._id,
        'metadata.invitationStatus': 'PENDING'
    });

    if (pendingInvitation) {
        throw new AppError('User already has a pending invitation for this project', 409);
    }

    await createAuditLog({
        module: 'PROJECTS',
        action: 'PROJECT_MEMBER_INVITED',
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
        message: `Te invitaron a unirte al proyecto "${project.name}"`,
        relatedProject: project._id,
        forceInApp: true,
        metadata: {
            projectId: project._id.toString(),
            invitedBy: currentUser._id.toString(),
            invitationStatus: 'PENDING',
            invitedAt: new Date().toISOString()
        }
    });

    return project;
}

async function updateProjectMemberRole(projectId, userId, role, currentUser) {
    const project = await ensureProjectWritable(projectId, currentUser);

    if (!canManageProjectMembers(project, currentUser)) {
        throw new AppError('Only the owner or ADMIN can manage project members', 403);
    }

    if (project.owner.toString() === userId.toString()) {
        throw new AppError('Project owner role cannot be changed', 400);
    }

    const member = project.members.find((item) => item.user.toString() === userId.toString());

    if (!member) {
        throw new AppError('Project member not found', 404);
    }

    if (member.role === 'OWNER') {
        throw new AppError('Owner membership cannot be changed', 400);
    }

    const previousRole = member.role;
    member.role = role;
    await project.save();

    await createAuditLog({
        module: 'PROJECTS',
        action: 'PROJECT_MEMBER_ROLE_UPDATED',
        actor: currentUser._id,
        project: project._id,
        resourceType: 'Project',
        resourceId: project._id.toString(),
        metadata: { userId: userId.toString(), previousRole, currentRole: role }
    });

    return project;
}

async function removeProjectMember(projectId, userId, currentUser) {
    const project = await ensureProjectWritable(projectId, currentUser);

    if (!canManageProjectMembers(project, currentUser)) {
        throw new AppError('Only the owner or ADMIN can manage project members', 403);
    }

    if (project.owner.toString() === userId.toString()) {
        throw new AppError('Project owner cannot be removed', 400);
    }

    const memberIndex = project.members.findIndex((item) => item.user.toString() === userId.toString());

    if (memberIndex === -1) {
        throw new AppError('Project member not found', 404);
    }

    const [removedMember] = project.members.splice(memberIndex, 1);
    await project.save();

    await createAuditLog({
        module: 'PROJECTS',
        action: 'PROJECT_MEMBER_REMOVED',
        actor: currentUser._id,
        project: project._id,
        resourceType: 'Project',
        resourceId: project._id.toString(),
        metadata: { userId: userId.toString(), previousRole: removedMember.role }
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
    getProjectMemberRole,
    canManageProjectMembers,
    canManageProjectBoards,
    canCoordinateProjectTasks,
    attachProjectProgress,
    calculateProjectProgress,
    createProject,
    listProjectsForUser,
    updateProject,
    archiveProject,
    addProjectMember,
    updateProjectMemberRole,
    removeProjectMember,
    cloneProject
};
