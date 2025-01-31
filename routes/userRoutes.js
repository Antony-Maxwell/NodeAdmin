const express = require('express');
const router = express.Router();
const upload = require('../middileware/multer')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const brandController = require('../controllers/brandController')



//category urls
router.post('/addCategory', upload.single('image'), categoryController.addCategory);
router.get('/getCategory',categoryController.getCategory)
router.put('/editCategory',categoryController.updateCategory)

//product urls
router.post('/addProduct', upload.fields([
    { name: 'product_image', maxCount: 1 },
    { name: 'product_sub_images', maxCount: 5 }
]), productController.addProduct);
router.get('/getProducts', productController.getProduct)

//brands url
router.post('/addBrand', upload.single('image'), brandController.addBrand);
router.get('/getBrands', brandController.getBrand)

module.exports = router;
