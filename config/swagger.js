const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TaskFlow API',
            version: '1.0.0',
            description: 'API del MVP backend de TaskFlow'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                RegisterRequest: {
                    type: 'object',
                    required: ['fullName', 'email', 'password'],
                    properties: {
                        fullName: { type: 'string', example: 'Sebas Test' },
                        email: { type: 'string', example: 'sebas@test.com' },
                        password: { type: 'string', example: 'TaskFlow123' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', example: 'sebas@test.com' },
                        password: { type: 'string', example: 'TaskFlow123' }
                    }
                },
                ProfileUpdateRequest: {
                    type: 'object',
                    properties: {
                        fullName: { type: 'string', example: 'Sebastian Quintero' },
                        avatarUrl: { type: 'string', example: 'https://example.com/avatar.png' },
                        bio: { type: 'string', example: 'Desarrollador del proyecto' },
                        notificationPreferences: {
                            $ref: '#/components/schemas/NotificationPreferencesRequest'
                        }
                    }
                },
                NotificationPreferencesRequest: {
                    type: 'object',
                    properties: {
                        inApp: {
                            $ref: '#/components/schemas/NotificationPreferenceChannelRequest'
                        },
                        email: {
                            $ref: '#/components/schemas/NotificationPreferenceChannelRequest'
                        }
                    }
                },
                NotificationPreferenceChannelRequest: {
                    type: 'object',
                    properties: {
                        projectMemberAdded: { type: 'boolean', example: true },
                        projectArchived: { type: 'boolean', example: true },
                        taskAssigned: { type: 'boolean', example: true },
                        taskMoved: { type: 'boolean', example: true },
                        taskCommented: { type: 'boolean', example: true }
                    }
                },
                ProjectRequest: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'Proyecto MVP' },
                        description: { type: 'string', example: 'Proyecto de prueba' },
                        startDate: { type: 'string', format: 'date-time' },
                        estimatedEndDate: { type: 'string', format: 'date-time' }
                    }
                },
                ProjectUpdateRequest: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Proyecto Ajustado' },
                        description: { type: 'string', example: 'Descripcion actualizada' },
                        startDate: { type: 'string', format: 'date-time' },
                        estimatedEndDate: { type: 'string', format: 'date-time' },
                        status: {
                            type: 'string',
                            enum: ['PLANIFICADO', 'EN_PROGRESO', 'PAUSADO', 'COMPLETADO', 'ARCHIVADO']
                        }
                    }
                },
                ProjectMemberRequest: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: { type: 'string', example: 'dev.demo@taskflow.local' }
                    }
                },
                BoardCreateRequest: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Tablero QA' },
                        columns: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/BoardColumnRequest' }
                        }
                    }
                },
                BoardColumnRequest: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: { type: 'string', example: 'En QA' },
                        order: { type: 'number', example: 5 },
                        wipLimit: { type: 'number', example: 2 }
                    }
                },
                BoardColumnUpdateRequest: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', example: 'Listo para validar' },
                        order: { type: 'number', example: 2 },
                        wipLimit: { type: 'number', example: 4 }
                    }
                },
                ReorderColumnsRequest: {
                    type: 'object',
                    required: ['columns'],
                    properties: {
                        columns: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['columnId', 'order'],
                                properties: {
                                    columnId: { type: 'string', example: '69c3100bc48da5686d5e0a82' },
                                    order: { type: 'number', example: 1 }
                                }
                            }
                        }
                    }
                },
                LabelRequest: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'backend' },
                        color: { type: 'string', example: '#2563eb' }
                    }
                },
                SubtaskCreateRequest: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: { type: 'string', example: 'Diseñar endpoint' },
                        isCompleted: { type: 'boolean', example: false }
                    }
                },
                SubtaskUpdateRequest: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', example: 'Diseñar endpoint final' },
                        isCompleted: { type: 'boolean', example: true }
                    }
                },
                TaskRequest: {
                    type: 'object',
                    required: ['title', 'project', 'board', 'columnId'],
                    properties: {
                        title: { type: 'string', example: 'Corregir login' },
                        description: { type: 'string', example: 'Validar JWT' },
                        type: { type: 'string', enum: ['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT'] },
                        priority: { type: 'string', enum: ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] },
                        dueDate: { type: 'string', format: 'date-time' },
                        estimatedHours: { type: 'number', example: 6 },
                        project: { type: 'string', example: '69c3100bc48da5686d5e0a7f' },
                        board: { type: 'string', example: '69c3100bc48da5686d5e0a81' },
                        columnId: { type: 'string', example: '69c3100bc48da5686d5e0a82' },
                        assignees: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        labels: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/LabelRequest' }
                        },
                        subtasks: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/SubtaskCreateRequest' }
                        }
                    }
                },
                TaskUpdateRequest: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', example: 'Actualizar login' },
                        description: { type: 'string', example: 'Cambios sobre autenticacion' },
                        type: { type: 'string', enum: ['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT'] },
                        priority: { type: 'string', enum: ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] },
                        dueDate: { type: 'string', format: 'date-time' },
                        estimatedHours: { type: 'number', example: 8 },
                        assignees: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        labels: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/LabelRequest' }
                        },
                        subtasks: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/SubtaskCreateRequest' }
                        }
                    }
                },
                AssignTaskRequest: {
                    type: 'object',
                    required: ['assignees'],
                    properties: {
                        assignees: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['69c30f8ec48da5686d5e0a6f']
                        }
                    }
                },
                CommentRequest: {
                    type: 'object',
                    required: ['content'],
                    properties: {
                        content: { type: 'string', example: 'Comentario de prueba' }
                    }
                },
                MoveTaskRequest: {
                    type: 'object',
                    required: ['toColumnId'],
                    properties: {
                        toColumnId: { type: 'string', example: '69c3100bc48da5686d5e0a83' }
                    }
                },
                TimeLogRequest: {
                    type: 'object',
                    required: ['hours'],
                    properties: {
                        hours: { type: 'number', example: 1.5 },
                        note: { type: 'string', example: 'Revision del bug' }
                    }
                },
                UserRoleRequest: {
                    type: 'object',
                    required: ['role'],
                    properties: {
                        role: {
                            type: 'string',
                            enum: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
                            example: 'PROJECT_MANAGER'
                        }
                    }
                },
                UserStatusRequest: {
                    type: 'object',
                    required: ['isActive'],
                    properties: {
                        isActive: { type: 'boolean', example: true }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js', './app.js']
};

module.exports = swaggerJsdoc(options);
