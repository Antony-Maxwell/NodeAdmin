const express = require('express');
const router = express.Router();
const upload = require('../middileware/multer')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const brandController = require('../controllers/brandController')
const bannerController = require('../controllers/bannerController')




//category urls
router.post('/addCategory', upload.single('image'), categoryController.addCategory);
router.get('/getCategory',categoryController.getCategory)
router.put('/editCategory',categoryController.updateCategory)

//product urls
router.post(
    '/addProduct',
    (req, res, next) => {
        console.log('Incoming request for product addition');
        console.log('Content-Type:', req.headers['content-type']);
        next();
    },
    upload.fields([
        { name: 'image', maxCount: 1 }, // Main product image
        { name: 'product_sub_images', maxCount: 5 } // Sub-images (without [])
    ]),
    async (req, res, next) => {
        try {
            if (!req.files) {
                return res.status(400).json({
                    status: false,
                    message: 'No files uploaded'
                });
            }
            next();
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error processing uploaded files',
                error: error.message
            });
        }
    },
    productController.addProduct
);


router.get('/getProducts', productController.getProduct);
router.delete('/deleteProduct/:id', productController.deleteProduct);
router.post('/updateProduct', 
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'product_sub_images', maxCount: 5 }
    ]),
    productController.updateProduct
);

//brands urls
router.post('/addBrand', upload.single('image'), brandController.addBrand);
router.get('/getBrands', brandController.getBrand);

//banner urls
router.post('/addBanner', upload.single('image'), bannerController.addBanner);
router.get('/getBanner', bannerController.getBanner);

module.exports = router;
