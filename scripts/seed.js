require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Board = require('../models/board');
const Project = require('../models/project');
const Task = require('../models/task');
const User = require('../models/user');
const { DEFAULT_BOARD_COLUMNS } = require('../utils/constants');

const DEMO_PASSWORD = 'TaskFlow123';
const DEMO_USERS = [
    {
        fullName: 'Admin Demo',
        email: 'admin.demo@taskflow.local',
        role: 'ADMIN',
        bio: 'Usuario administrador para pruebas de la plataforma.'
    },
    {
        fullName: 'Project Manager Demo',
        email: 'pm.demo@taskflow.local',
        role: 'PROJECT_MANAGER',
        bio: 'Usuario PM para pruebas de proyectos y tablero.'
    },
    {
        fullName: 'Developer Demo',
        email: 'dev.demo@taskflow.local',
        role: 'DEVELOPER',
        bio: 'Usuario developer para pruebas de tareas.'
    }
];

async function waitForMongo(uri, retries = 20) {
    let lastError = null;

    for (let attempt = 1; attempt <= retries; attempt += 1) {
        try {
            await mongoose.connect(uri);
            return;
        } catch (error) {
            lastError = error;
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }

    throw lastError;
}

async function upsertDemoUsers() {
    const password = await bcrypt.hash(DEMO_PASSWORD, 10);
    const users = {};

    for (const demoUser of DEMO_USERS) {
        const user = await User.findOneAndUpdate(
            { email: demoUser.email },
            {
                $set: {
                    fullName: demoUser.fullName,
                    role: demoUser.role,
                    bio: demoUser.bio,
                    avatarUrl: '',
                    isActive: true,
                    isEmailVerified: true,
                    emailVerificationTokenHash: null,
                    emailVerificationExpiresAt: null
                },
                $setOnInsert: {
                    password
                }
            },
            { new: true, upsert: true }
        );

        users[demoUser.role] = user;
    }

    return users;
}

async function upsertDemoProject(users) {
    const owner = users.ADMIN;
    const members = [users.ADMIN, users.PROJECT_MANAGER, users.DEVELOPER];

    let project = await Project.findOne({
        name: 'Proyecto Demo TaskFlow',
        owner: owner._id
    });

    if (!project) {
        project = await Project.create({
            name: 'Proyecto Demo TaskFlow',
            description: 'Proyecto semilla para probar auth, proyectos, tableros y tareas.',
            startDate: new Date(),
            estimatedEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
            status: 'EN_PROGRESO',
            owner: owner._id,
            members: members.map((member, index) => ({
                user: member._id,
                role: index === 0 ? 'OWNER' : 'MEMBER',
                invitedAt: new Date()
            }))
        });
    }

    let board = await Board.findOne({ project: project._id, isDefault: true });

    if (!board) {
        board = await Board.create({
            name: 'Tablero Principal',
            project: project._id,
            isDefault: true,
            columns: DEFAULT_BOARD_COLUMNS
        });
    }

    const existingTasks = await Task.countDocuments({ project: project._id });

    if (!existingTasks) {
        const columnsByTitle = Object.fromEntries(
            board.columns.map((column) => [column.title, column])
        );

        await Task.create([
            {
                title: '[BUG] Ajustar validacion de login',
                description: 'Revisar mensajes de error y reglas basicas de autenticacion.',
                priority: 'ALTA',
                type: 'BUG',
                project: project._id,
                board: board._id,
                columnId: columnsByTitle['Por hacer']._id,
                createdBy: users.ADMIN._id,
                assignees: [users.DEVELOPER._id],
                labels: [{ name: 'backend', color: '#2563eb' }],
                subtasks: [
                    { title: 'Revisar validacion de email', isCompleted: true },
                    { title: 'Ajustar respuesta 401', isCompleted: false }
                ],
                comments: [
                    {
                        author: users.ADMIN._id,
                        content: 'Esta tarea queda para validar el flujo de login.'
                    }
                ],
                timeLogs: [
                    {
                        user: users.DEVELOPER._id,
                        hours: 1.5,
                        note: 'Analisis inicial del bug'
                    }
                ],
                history: [
                    {
                        action: 'TASK_CREATED',
                        performedBy: users.ADMIN._id,
                        toColumnId: columnsByTitle['Por hacer']._id,
                        metadata: { seeded: true }
                    }
                ]
            },
            {
                title: 'Implementar tablero principal',
                description: 'Preparar estructura base del tablero Kanban.',
                priority: 'MEDIA',
                type: 'FEATURE',
                project: project._id,
                board: board._id,
                columnId: columnsByTitle['En progreso']._id,
                createdBy: users.PROJECT_MANAGER._id,
                assignees: [users.DEVELOPER._id],
                labels: [{ name: 'kanban', color: '#059669' }],
                subtasks: [
                    { title: 'Crear columnas iniciales', isCompleted: true },
                    { title: 'Probar movimiento de tareas', isCompleted: false }
                ],
                history: [
                    {
                        action: 'TASK_CREATED',
                        performedBy: users.PROJECT_MANAGER._id,
                        toColumnId: columnsByTitle['En progreso']._id,
                        metadata: { seeded: true }
                    }
                ]
            },
            {
                title: 'Documentar endpoints base',
                description: 'Actualizar README y guia de pruebas.',
                priority: 'BAJA',
                type: 'TASK',
                project: project._id,
                board: board._id,
                columnId: columnsByTitle['Completado']._id,
                createdBy: users.ADMIN._id,
                assignees: [users.PROJECT_MANAGER._id],
                labels: [{ name: 'docs', color: '#7c3aed' }],
                subtasks: [
                    { title: 'Listar endpoints', isCompleted: true },
                    { title: 'Agregar ejemplos de Postman', isCompleted: true }
                ],
                history: [
                    {
                        action: 'TASK_CREATED',
                        performedBy: users.ADMIN._id,
                        toColumnId: columnsByTitle['Completado']._id,
                        metadata: { seeded: true }
                    }
                ]
            }
        ]);
    }

    return { project, board };
}

async function run() {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error('MONGO_URI is required for seeding');
    }

    if (process.env.SEED_DATA !== 'true') {
        console.log('Seed skipped because SEED_DATA is not true');
        return;
    }

    await waitForMongo(mongoUri);
    const users = await upsertDemoUsers();
    const { project, board } = await upsertDemoProject(users);

    console.log(
        JSON.stringify(
            {
                seeded: true,
                users: DEMO_USERS.map((user) => ({
                    email: user.email,
                    role: user.role,
                    password: DEMO_PASSWORD
                })),
                projectId: project._id,
                boardId: board._id
            },
            null,
            2
        )
    );

    await mongoose.disconnect();
}

run().catch(async (error) => {
    console.error(error);
    try {
        await mongoose.disconnect();
    } catch {}
    process.exit(1);
});
