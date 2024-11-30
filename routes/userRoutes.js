const express = require('express');
const router = express.Router();
const upload = require('../middileware/multer')
const categoryController = require('../controllers/categoryController')


router.post('/addCategory', upload.single('image'), categoryController.addCategory);
router.get('/getCategory',categoryController.getCategory)
router.put('/editCategory',categoryController.updateCategory)

module.exports = router;
