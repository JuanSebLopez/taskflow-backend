const USER_ROLES = ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'];
const PROJECT_STATUSES = ['PLANIFICADO', 'EN_PROGRESO', 'PAUSADO', 'COMPLETADO', 'ARCHIVADO'];
const TASK_PRIORITIES = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
const TASK_TYPES = ['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT'];
const NOTIFICATION_CHANNELS = ['IN_APP', 'EMAIL'];
const NOTIFICATION_TYPES = [
    'PROJECT_MEMBER_ADDED',
    'PROJECT_ARCHIVED',
    'TASK_ASSIGNED',
    'TASK_MOVED',
    'TASK_COMMENTED'
];
const AUDIT_MODULES = ['USERS', 'PROJECTS', 'BOARDS', 'TASKS', 'NOTIFICATIONS', 'SETTINGS', 'REPORTS'];

const DEFAULT_BOARD_COLUMNS = [
    { title: 'Por hacer', order: 1, wipLimit: 0 },
    { title: 'En progreso', order: 2, wipLimit: 3 },
    { title: 'En revision', order: 3, wipLimit: 2 },
    { title: 'Completado', order: 4, wipLimit: 0 }
];

module.exports = {
    USER_ROLES,
    PROJECT_STATUSES,
    TASK_PRIORITIES,
    TASK_TYPES,
    NOTIFICATION_CHANNELS,
    NOTIFICATION_TYPES,
    AUDIT_MODULES,
    DEFAULT_BOARD_COLUMNS
};
