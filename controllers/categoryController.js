const Category = require('../models/categoryModel')

const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file?.path;

        if (!name || !image) {
            return res.status(400).json({
                status: false,
                message: 'Name and image are required',
            });
        }

        // Use environment variable for host URL in production
        const host = process.env.HOST || `${req.protocol}://${req.get('host')}`;
        const relativeImagePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
        const imageUrl = `${host}/uploads/${relativeImagePath}`;
        console.log('Received File:', req.file);
        console.log('file path', imageUrl);
        



        const category = new Category({ 
            name, 
            image: imageUrl,
        });

        await category.save();

        res.status(201).json({
            status: true,
            message: 'Category added successfully',
            data: category,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: 'Failed to add category',
            error: error.message,
        });
    }
};


const getCategory = async (req, res) => {
    try {
        const categories = await Category.find({}).lean();
        
        if (!categories?.length) {
            return res.status(200).json({
                status: false,
                message: 'No categories found'
            });
        }
 
        return res.status(200).json({
            status: true,
            count: categories.length,
            data: categories
        });
 
    } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
 };

 const updateCategory = async (req, res) => {
    try {
        // const { categoryId } = req.params;
        const { categoryId,name, image } = req.body;
 
        if (!name && !image) {
            return res.status(400).json({
                status: false,
                message: 'Provide at least one field to update'
            });
        }
 
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { $set: { name, image } },
            { new: true }
        );
 
        if (!updatedCategory) {
            return res.status(404).json({
                status: false,
                message: 'Category not found'
            });
        }
 
        return res.status(200).json({
            status: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
 
    } catch (error) {
        console.error('Error updating category:', error);
        return res.status(500).json({
            status: false, 
            message: 'Failed to update category',
            error: error.message
        });
    }
 };

module.exports = {addCategory,getCategory,updateCategory}