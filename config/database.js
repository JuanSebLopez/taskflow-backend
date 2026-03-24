const mongoose = require('mongoose');
require('dotenv').config();

class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }
        Database.instance = this;
    }

    async connect() {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ MongoDB Atlas conectado (Patrón Singleton)');
        } catch (err) {
            console.error('❌ Error conexión:', err.message);
            process.exit(1);
        }
    }
}

module.exports = new Database();