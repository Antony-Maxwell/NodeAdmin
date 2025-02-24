const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
    image : {
        type: String,
        required: false,
    },
});

module.exports = mongoose.model('Banner', bannerSchema);