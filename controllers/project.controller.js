const Project = require('../models/project'); 


const getAll = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ mensaje: "Error al obtener proyectos", error: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ mensaje: "Proyecto no encontrado" });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const create = async (req, res) => {
    try {
        const nuevoProyecto = new Project(req.body);
        const guardado = await nuevoProyecto.save();
        res.status(201).json(guardado);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const update = async (req, res) => {
    try {
        const editado = await Project.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } 
        );
        res.json(editado);
    } catch (err) { 
        res.status(400).json({ error: err.message }); 
    }
};


const remove = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Proyecto eliminado correctamente" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};


module.exports = { getAll, getById, create, update, remove };