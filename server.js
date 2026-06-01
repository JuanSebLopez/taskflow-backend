require('dotenv').config();
const app = require('./app');
const db = require('./config/database');
const { registerObservers } = require('./services/events/observer-registry');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    await db.connect();
    registerObservers();

    app.listen(PORT, () => {
        console.log(`TaskFlow backend running on http://localhost:${PORT}`);
    });
}

bootstrap();
