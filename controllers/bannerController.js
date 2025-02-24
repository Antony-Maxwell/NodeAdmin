const Banner = require('../models/bannerModel');

const addBanner = async (req, res) => {
    try{
        const image = req.file?.path;

        if(!image){
            return res.status(400).json({
                status : false,
                message : "image is required",
            });
        }

        const host = process.env.HOST || `${req.protocol}://${req.get('host')}`;
                const imageUrl = `${host}/${image.replace(/\\/g, '/')}`;
        
                const banner = Banner({
                    image: imageUrl
                });
        
                await banner.save();
        
                res.status(201).json({
                    status: true,
                    message: 'banner added successfully',
                    data: banner,
                });
    }catch(e){
        console.error(e);
        res.status(500).json({
            status: false,
            message: 'Failed to add banner',
            error: error.message,
        });
    }
}

const getBanner = async (req, res) => {
    try{
        const banner = await Banner.find({}).lean();

        if(!banner?.length){
            return res.status(200).json({
                status: false,
                message: 'No banners found'
            });
        }

        return res.status(200).json({
            status: true,
            count: banner.length,
            data: banner
        });

    }catch(error){
        console.log('error fetching banners', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
}

module.exports = {addBanner, getBanner}