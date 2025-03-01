const Product = require('../models/productModel');

const addProduct = async (req, res) => {
   try {

    console.log('Request files:', req.files); // Add this log
       console.log('Request body:', req.body); 


       const {
           product_name,
           product_description,
           product_act_price,
           product_sell_price,
           is_color_available,
           product_colors,
           is_size_available,
           size_in_measurment,
           product_size,
           product_category,
           product_brand
       } = req.body;

       const image = req.files['image'] ? req.files['image'][0].path : null;

       // Handle multiple sub-images
       const product_sub_images = req.files['product_sub_images']
           ? req.files['product_sub_images'].map(file => file.path)
           : [];

       console.log('Main Image URL:', image);
       console.log('Sub Image URLs:', product_sub_images);

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

       if (!image) {
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


       const newProduct = new Product({
           product_name,
           product_description,
           product_act_price,
           product_sell_price,
           image,
           product_sub_images,
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
            return res.status(200).json({
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

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(200).json({
                status: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Product deleted successfully",
            data: deletedProduct
        });

    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
    
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.body.id; // Get product ID from URL parameter
        
        console.log('Request files:', req.files);
        console.log('Request body:', req.body);

        const {
            product_name,
            product_description,
            product_act_price,
            product_sell_price,
            is_color_available,
            product_colors,
            is_size_available,
            size_in_measurment,
            product_size,
            product_category,
            product_brand
        } = req.body;

        // Find existing product first
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({
                status: false,
                message: 'Product not found'
            });
        }

        // Handle image updates
        const host = process.env.HOST || `${req.protocol}://${req.get('host')}`;
        let imageUrl = existingProduct.image; // Keep existing image by default

        if (req.files?.['image']) {
            const image = req.files['image'][0].path;
            const relativeImagePath = image.replace(/\\/g, '/').split('uploads/')[1];
            imageUrl = `${host}/uploads/${relativeImagePath}`;
            
            // Delete old image file if it exists
            if (existingProduct.image) {
                const oldImagePath = existingProduct.image.split('/uploads/')[1];
                const fullPath = path.join(process.env.UPLOADS_DIR || 'uploads', oldImagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
        }

        // Handle sub-images update
        let subImageUrls = existingProduct.product_sub_images; // Keep existing sub-images by default

        if (req.files?.['product_sub_images[]']) {
            // Delete old sub-image files
            if (existingProduct.product_sub_images?.length > 0) {
                existingProduct.product_sub_images.forEach(subImage => {
                    const oldSubImagePath = subImage.split('/uploads/')[1];
                    const fullPath = path.join(process.env.UPLOADS_DIR || 'uploads', oldSubImagePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                });
            }

            // Add new sub-images
            subImageUrls = req.files['product_sub_images[]'].map(file => {
                const relativePath = file.path.replace(/\\/g, '/').split('uploads/')[1];
                return `${host}/uploads/${relativePath}`;
            });
        }

        // Validation checks (same as addProduct)
        if (product_name && product_name.trim().length < 3) {
            return res.status(400).json({
                status: false,
                message: 'Product name must be at least 3 characters long'
            });
        }

        if (product_description && product_description.trim().length < 10) {
            return res.status(400).json({
                status: false,
                message: 'Product description must be at least 10 characters long'
            });
        }

        const priceRegex = /^\d+(\.\d{1,2})?$/;
        if (product_act_price && !priceRegex.test(product_act_price)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid actual price format'
            });
        }

        if (product_sell_price && !priceRegex.test(product_sell_price)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid selling price format'
            });
        }

        if (product_act_price && product_sell_price && 
            parseFloat(product_sell_price) >= parseFloat(product_act_price)) {
            return res.status(400).json({
                status: false,
                message: 'Selling price must be lower than actual price'
            });
        }

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

        // Create update object with only provided fields
        const updateData = {
            ...(product_name && { product_name }),
            ...(product_description && { product_description }),
            ...(product_act_price && { product_act_price }),
            ...(product_sell_price && { product_sell_price }),
            ...(imageUrl && { image: imageUrl }),
            ...(subImageUrls && { product_sub_images: subImageUrls }),
            ...(is_color_available && { is_color_available }),
            ...(product_colors && { product_colors }),
            ...(is_size_available && { is_size_available }),
            ...(size_in_measurment && { size_in_measurment }),
            ...(product_size && { product_size }),
            ...(product_category && { product_category }),
            ...(product_brand && { product_brand })
        };

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            status: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};


module.exports = { addProduct, getProduct, deleteProduct, updateProduct}