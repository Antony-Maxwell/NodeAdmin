const Product = require('../models/productModel');

const addProduct = async (req, res) => {
   try {
       const {
           product_name,
           product_description,
           product_act_price,
           product_sell_price,
           product_image,
           product_sub_images,
           is_color_available,
           product_colors,
           is_size_available,
           size_in_measurment,
           product_size,
           product_category,
           product_brand
       } = req.body;

       // Validation checks
       if (!product_name || product_name.trim().length < 3) {
           return res.status(400).json({
               status: false,
               message: 'Product name must be at least 3 characters long' 
           });
       }

       if (!product_description || product_description.trim().length < 10) {
           return res.status(400).json({
               status: false,
               message: 'Product description must be at least 10 characters long' 
           });
       }

       if (!product_image) {
           return res.status(400).json({ 
               status: false,
               message: 'Product main image is required' 
           });
       }

       const priceRegex = /^\d+(\.\d{1,2})?$/;
       if (!product_act_price || !priceRegex.test(product_act_price)) {
           return res.status(400).json({
               status: false,
               message: 'Invalid actual price format' 
           });
       }

       if (!product_sell_price || !priceRegex.test(product_sell_price)) {
           return res.status(400).json({ 
               status: false,
               message: 'Invalid selling price format' 
           });
       }

       if (parseFloat(product_sell_price) >= parseFloat(product_act_price)) {
           return res.status(400).json({
               status: false,
               message: 'Selling price must be lower than actual price' 
           });
       }

       // Optional but validated fields
       if (is_color_available === 'Yes' && (!product_colors || product_colors.length === 0)) {
           return res.status(400).json({ 
               status: false,
               message: 'Colors must be specified if color is available' 
           });
       }

       if (is_size_available === 'Yes' && (!product_size || product_size.length === 0)) {
           return res.status(400).json({ 
               status: false,
               message: 'Sizes must be specified if size is available' 
           });
       }

    //    const host = process.env.HOST || `${req.protocol}://${req.get('host')}`;
    //     const imageUrl = `${host}/${image.replace(/\\/g, '/')}`;

       const newProduct = new Product({
           product_name,
           product_description,
           product_act_price,
           product_sell_price,
           product_image,
           product_sub_images: product_sub_images || [],
           is_color_available,
           product_colors: product_colors || [],
           is_size_available,
           size_in_measurment,
           product_size: product_size || [],
           product_category,
           product_brand
       });

       const savedProduct = await newProduct.save();

       res.status(201).json({
           status: true,
           message: 'Product added successfully',
           data: savedProduct
       });
   } catch (error) {
       res.status(500).json({
           status: false,
           message: 'Error adding product',
           error: error.message
       });
   }
};

const getProduct = async (req, res) => {
    try{
        const products = await Product.find({}).lean();

        if(!products?.length){
            return res.status(404).json({
                status: false,
                message: 'No products found'
            });
        }

        return res.status(200).json({
            status: true,
            message: "Products returned successfully",
            data: products
        });

    }catch (error){
        console.error('Error fetching categories:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
}

module.exports = { addProduct, getProduct}