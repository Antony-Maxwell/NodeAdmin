// File: middleware/cloudinaryUpload.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up temporary storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Create multer upload middleware
const upload = multer({ storage });

// Middleware to upload to Cloudinary after multer processes the file
const uploadToCloudinary = async (req, res, next) => {
  try {
    // For single file upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'app_uploads'
      });
      
      // Add Cloudinary URL to request
      req.file.cloudinaryUrl = result.secure_url;
      req.file.cloudinaryPublicId = result.public_id;
      
      // Delete temporary file
      fs.unlinkSync(req.file.path);
    }
    
    // For multiple files upload
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'app_uploads'
        });
        
        file.cloudinaryUrl = result.secure_url;
        file.cloudinaryPublicId = result.public_id;
        
        // Delete temporary file
        fs.unlinkSync(file.path);
      }
    }
    
    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    next(error);
  }
};

module.exports = {
  upload,
  uploadToCloudinary
};