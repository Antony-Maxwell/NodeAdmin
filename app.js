const express = require('express');
const dotenv = require('dotenv');
const {connectDB }= require('./config/db');
const userRoutes = require('./routes/userRoutes')
const fs = require('fs');
const path = require('path');

const cors = require('cors');
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', userRoutes)
// app.use('/restaurant',restaurantRoutes)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
