const mongoose = require('mongoose');

const brandSchema = mongoose.Schema({
    product_id : {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: true,
    },
    brand_name : {
        type: String,
        required : true,
    },
});


module.exports = mongoose.model('Brand', brandSchema);