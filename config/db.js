// config/connectDB.js
const mongoose = require('mongoose');
require("dotenv").config();

let dbInstance;

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            ssl: true,
            serverSelectionTimeoutMS: 5000,
        });
        dbInstance = connection.connection.db;
        console.log('Connected to MongoDB');
        return dbInstance; // Return the MongoDB instance
    } catch (err) {
        console.error("MongoDB Connection Error ❌", err);
        process.exit(1); // Exit process with failure
    }
};

const getDBInstance = () => {
    if (!dbInstance) throw new Error('Database not initialized. Call connectDB first.');
    return dbInstance;
};

module.exports = { connectDB, getDBInstance };
