const Board = require('../../models/board');
const Project = require('../../models/project');
const Task = require('../../models/task');
const AppError = require('../../utils/app-error');
const { createAuditLog } = require('../audit-log.service');
const {
    addProjectMember,
    archiveProject,
    cloneProject,
    createProject,
    ensureProjectAccess,
    listProjectsForUser,
    updateProject
} = require('../project.service');

class ProjectFacade {
    async createProjectWorkspace(payload, currentUser) {
        return createProject(payload, currentUser);
    }

    async listAccessibleProjects(currentUser) {
        return listProjectsForUser(currentUser);
    }

    async getProjectDetails(projectId, currentUser) {
        return ensureProjectAccess(projectId, currentUser);
    }

    async updateProjectDetails(projectId, payload, currentUser) {
        return updateProject(projectId, payload, currentUser);
    }

    async archiveProjectWorkspace(projectId, currentUser) {
        return archiveProject(projectId, currentUser);
    }

    async addMemberToProject(projectId, email, currentUser) {
        return addProjectMember(projectId, email, currentUser);
    }

    async cloneProjectWorkspace(projectId, currentUser) {
        return cloneProject(projectId, currentUser);
    }

    async deleteProjectWorkspace(projectId, currentUser) {
        const project = await ensureProjectAccess(projectId, currentUser);
        const canDelete = currentUser.role === 'ADMIN' || project.owner.toString() === currentUser._id.toString();

        if (!canDelete) {
            throw new AppError('Only the owner or ADMIN can delete the project', 403);
        }

        await createAuditLog({
            module: 'PROJECTS',
            action: 'PROJECT_DELETED',
            actor: currentUser._id,
            project: project._id,
            resourceType: 'Project',
            resourceId: project._id.toString(),
            metadata: {
                name: project.name,
                status: project.status
            }
        });

        await Task.deleteMany({ project: project._id });
        await Board.deleteMany({ project: project._id });
        await Project.findByIdAndDelete(project._id);
    }
}

module.exports = new ProjectFacade();
