const express = require('express');
require('dotenv').config();
console.log('UPLOADS_DIR:', process.env.UPLOADS_DIR); // Debug log

const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

connectDB();

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = process.env.UPLOADS_DIR ? 
    path.resolve(process.env.UPLOADS_DIR) : 
    path.join(__dirname, 'uploads');

    console.log('Using Uploads Directory:', uploadsDir);

try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('Created uploads directory:', uploadsDir);
    }
    console.log('Using uploads directory:', uploadsDir);
    console.log('Directory contents:', fs.readdirSync(uploadsDir));
} catch (error) {
    console.error('Error with uploads directory:', error);
}

app.use('/uploads', (req, res, next) => {
    const requestedFile = path.join(uploadsDir, path.basename(req.url));
    console.log({
        requestUrl: req.url,
        requestedFile,
        fileExists: fs.existsSync(requestedFile),
        uploadsDir,
        dirContents: fs.readdirSync(uploadsDir)
    });

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    next();
}, express.static(uploadsDir, {
    maxAge: '1d',
    dotfiles: 'deny',
    fallthrough: false,
    index: false
}), (err, req, res, next) => {
    console.error('Static file error:', err);
    res.status(404).json({
        status: false,
        message: 'File not found or access denied',
        debug: {
            requestedPath: req.url,
            fullPath: path.join(uploadsDir, path.basename(req.url)),
            exists: fs.existsSync(path.join(uploadsDir, path.basename(req.url)))
        }
    });
});

app.use('/', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: false,
        message: 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Performing graceful shutdown...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});