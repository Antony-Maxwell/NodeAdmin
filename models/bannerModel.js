const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
    banner_image : {
        type: String,
        required: false,
    },
});

module.exports = mongoose.model('Banner', bannerSchema);