const Category = require('../models/categoryModel')

const addCategory = async (req, res) => {
    try {
        const { name, image } = req.body;

        // Validate input
        if (!name || !image) {
            return res.status(400).json({ 
                status:false,
                data:{
                    message: 'Name and image are required'
                }
             });
        }

        // Create a new category
        const category = new Category({ name, image });

        // Save to database
        await category.save();

        res.status(201).json({ 
            status:true,
            data:{
                message: 'Category added successfully', category
            }
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status:false,
            data:{
                message: 'Failed to add category', error
            }
         });
    }
};

const getCategory = async (req, res) => {
    try {
        const categories = await Category.find({}).lean();
        
        if (!categories?.length) {
            return res.status(404).json({
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

module.exports = {addCategory,getCategory}