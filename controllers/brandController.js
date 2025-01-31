const Brand = require('../models/brandModel')


const addBrand = async (req, res) => {
    try{
        const image = req.file?.path;
        const { brand_name, product_id } = req.body;

        if(!brand_name || !image){
            return res.status(400).json({
                status : false,
                message : "Name and image are required",
            });
        }

        const host = process.env.HOST || `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${host}/${image.replace(/\\/g, '/')}`;

        const brand = Brand({
            image: imageUrl,
            brand_name,
            product_id
        });

        await brand.save();

        res.status(201).json({
            status: true,
            message: 'brand added successfully',
            data: brand,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: 'Failed to add brand',
            error: error.message,
        });
    }
}

const getBrand = async (req, res) => {
    try{
        const brands = await Brand.find({}).lean();

        if(!brands?.length){
            return res.status(404).json({
                status: false,
                message: 'No brands found'
            });
        }

        return res.status(200).json({
            status: true,
            count: brands.length,
            data: brands
        });

    }catch (error) {
        console.error('Error fetching brands:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

module.exports = {addBrand, getBrand}