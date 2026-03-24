const Task = require('../models/task');


const applyTaskFactory = (taskData) => {
    const data = { ...taskData };
    if (data.tipo === 'Bug') {
        data.prioridad = 'Alta';
        data.titulo = `[BUG] ${data.titulo}`;
    } else if (data.tipo === 'Feature') {
        data.prioridad = 'Media';
    }
    return data;
};

const getAll = async (req, res) => {
    try {
        const tasks = await Task.find({ proyectoId: req.query.proyectoId });
        res.json(tasks);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const create = async (req, res) => {
    try {
        
        const refinedData = applyTaskFactory(req.body);
        const nuevaTarea = new Task(refinedData);
        await nuevaTarea.save();
        res.status(201).json(nuevaTarea);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

const update = async (req, res) => {
    try {
        const editada = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(editada);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

const remove = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Tarea eliminada" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, create, update, remove };