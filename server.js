const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database'); 
const projectRoutes = require('./routes/project.route');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes');
const boardRoutes = require('./routes/board.routes');


const app = express();
app.use(cors());
app.use(express.json());


db.connect();

app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/boards', boardRoutes);

app.use('/api/project.ruta', projectRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor TaskFlow en http://localhost:${PORT}`);
});