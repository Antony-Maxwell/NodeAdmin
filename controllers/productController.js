const Product = require('../models/productModel');
const cloudinary = require('cloudinary').v2;

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
        const productId = req.body.id;

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
            product_brand,
            image
        } = req.body;

        // Find existing product
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({
                status: false,
                message: 'Product not found'
            });
        }

        let imageUrl = existingProduct.image;

        // Handle main image update
        if (req.files?.['image']?.[0]) {
            // New image file uploaded
            imageUrl = req.files['image'][0].path;

            // Delete old image from Cloudinary
            if (existingProduct.image) {
                try {
                    const publicId = extractPublicIdFromUrl(existingProduct.image);
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                    }
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }
        } else if (image && image !== existingProduct.image) {
            // Image URL provided in request body
            imageUrl = image;
        }

        // Handle sub-images update
        let subImageUrls = existingProduct.product_sub_images || [];
        const subImagesField = 'product_sub_images';

        if (req.files?.[subImagesField]) {
            // New sub-image files uploaded
            const newSubImageUrls = req.files[subImagesField].map(file => file.path);

            // Delete old sub-images from Cloudinary
            if (existingProduct.product_sub_images?.length > 0) {
                for (const subImage of existingProduct.product_sub_images) {
                    try {
                        const publicId = extractPublicIdFromUrl(subImage);
                        if (publicId) {
                            await cloudinary.uploader.destroy(publicId);
                            console.log(`Deleted old sub-image: ${publicId}`);
                        }
                    } catch (err) {
                        console.error('Error deleting old sub-image:', err);
                    }
                }
            }

            subImageUrls = newSubImageUrls;
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

function extractPublicIdFromUrl(url) {
    if (!url) return null;
    
    try {
        // Example URL: https://res.cloudinary.com/di31l0y9w/image/upload/v1740854715/app_uploads/1740854714886-1000197239.jpg
        const regex = /\/v\d+\/(.+)\.\w+$/;
        const match = url.match(regex);
        
        if (match && match[1]) {
            return match[1]; // Returns "app_uploads/1740854714886-1000197239"
        }
        return null;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
}

module.exports = { addProduct, getProduct, deleteProduct, updateProduct}