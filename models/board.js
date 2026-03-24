const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
    nombre: { type: String, default: 'Tablero Principal' },
    proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    columnas: [
        {
            titulo: { type: String, default: 'Por hacer' },
            limiteWIP: { type: Number, default: 5 } 
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Board', BoardSchema);