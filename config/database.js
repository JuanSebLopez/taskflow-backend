const mongoose = require('mongoose');

class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        Database.instance = this;
    }

    async connect() {
        if (this.connectionReady) {
            return mongoose.connection;
        }

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is required');
        }

        await mongoose.connect(process.env.MONGO_URI);
        this.connectionReady = true;
        console.log('MongoDB connected using Singleton pattern');
        return mongoose.connection;
    }
}

module.exports = new Database();
