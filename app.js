const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON and handle CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the uploads directory
// Use a persistent disk path if you're deploying to Render or similar platforms
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/', userRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
