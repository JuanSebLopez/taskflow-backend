const Board = require('../models/board');

const getByProject = async (req, res) => {
    try {
        const board = await Board.findOne({ proyectoId: req.params.projectId });
        res.json(board);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const create = async (req, res) => {
    try {
        const nuevoTablero = new Board(req.body);
        await nuevoTablero.save();
        res.status(201).json(nuevoTablero);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

const updateWIP = async (req, res) => {
    try {
        const { columnaId, limite } = req.body;
        const board = await Board.findOneAndUpdate(
            { "columnas._id": columnaId },
            { "$set": { "columnas.$.limiteWIP": limite } },
            { new: true }
        );
        res.json(board);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

module.exports = { getByProject, create, updateWIP };