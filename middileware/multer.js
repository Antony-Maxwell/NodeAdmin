
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'app_uploads', // Change to your preferred folder name
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], // Add any formats you need
    transformation: [{ width: 1000, crop: "limit" }], // Optional: resize images on upload
    // Optional: Add a unique filename with timestamp
    public_id: (req, file) => `${Date.now()}-${path.parse(file.originalname).name}`
  }
});

const upload = multer({ storage });

module.exports = upload;