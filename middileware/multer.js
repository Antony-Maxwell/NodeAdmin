const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Attempting to save file:', file.fieldname);
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        console.log('Saving as:', filename);
        cb(null, filename);
    }
});

const upload = multer({ storage });

module.exports = upload;