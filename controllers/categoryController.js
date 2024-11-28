const Category = require('../models/categoryModel')

const addCategory = async (req, res) => {
    try {
        const { name, image } = req.body;

        // Validate input
        if (!name || !image) {
            return res.status(400).json({ message: 'Name and image are required' });
        }

        // Create a new category
        const category = new Category({ name, image });

        // Save to database
        await category.save();

        res.status(201).json({ message: 'Category added successfully', category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add category', error });
    }
};

module.exports = {addCategory}