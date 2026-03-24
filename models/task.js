const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    titulo: { 
        type: String, 
        required: [true, 'El título de la tarea es obligatorio'] 
    },
    descripcion: { 
        type: String 
    },
    tipo: { 
        type: String, 
        required: true,
        enum: ['Bug', 'Feature', 'Mejora', 'General'],
        default: 'General'
    },
    prioridad: { 
        type: String, 
        enum: ['Baja', 'Media', 'Alta', 'Urgente'], 
        default: 'Media' 
    },
    estado: { 
        type: String, 
        enum: ['Por hacer', 'En progreso', 'Revision', 'Finalizada'], 
        default: 'Por hacer' 
    },
    proyectoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', // Relación con el modelo de Proyectos
        required: true 
    },
    asignadoA: { 
        type: String, 
        default: 'Sin asignar' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);