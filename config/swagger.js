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
                TaskRequest: {
                    type: 'object',
                    required: ['title', 'project', 'board', 'columnId'],
                    properties: {
                        title: { type: 'string', example: 'Corregir login' },
                        description: { type: 'string', example: 'Validar JWT' },
                        type: { type: 'string', example: 'BUG' },
                        priority: { type: 'string', example: 'ALTA' },
                        project: { type: 'string', example: '69c3100bc48da5686d5e0a7f' },
                        board: { type: 'string', example: '69c3100bc48da5686d5e0a81' },
                        columnId: { type: 'string', example: '69c3100bc48da5686d5e0a82' }
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
                }
            }
        }
    },
    apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);
