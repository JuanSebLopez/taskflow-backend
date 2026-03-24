require('dotenv').config();
const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    await db.connect();

    app.listen(PORT, () => {
        console.log(`TaskFlow backend running on http://localhost:${PORT}`);
    });
}

bootstrap();
