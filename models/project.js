const mongoose = require('mongoose');


const ProjectSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: [true, 'taskflow'] 
    },
    descripcion: { 
        type: String 
    },
    fechaInicio: { 
        type: Date, 
        default: Date.now 
    },
    creador: { 
        type: String, 
        default: 'Admin' 
    },
    estado: { 
        type: String, 
        enum: ['activo', 'archivado'], 
        default: 'activo' 
    }
}, { timestamps: true }); 

module.exports = mongoose.model('Project', ProjectSchema);