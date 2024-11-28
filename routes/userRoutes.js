const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController')

router.post('/addCategory',categoryController.addCategory)
router.get('/getCategory',categoryController.getCategory)

module.exports = router;
