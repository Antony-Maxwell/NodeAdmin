const express = require('express');
const router = express.Router();
const upload = require('../middileware/multer')
const categoryController = require('../controllers/categoryController')

// router.post('/addCategory',categoryController.addCategory)
router.post('/addCategory', upload.single('image'), categoryController.addCategory);
router.get('/getCategory',categoryController.getCategory)

module.exports = router;
