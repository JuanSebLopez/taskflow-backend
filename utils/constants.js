const USER_ROLES = ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'];
const PROJECT_STATUSES = ['PLANIFICADO', 'EN_PROGRESO', 'PAUSADO', 'COMPLETADO', 'ARCHIVADO'];
const TASK_PRIORITIES = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
const TASK_TYPES = ['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT'];

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
    DEFAULT_BOARD_COLUMNS
};
