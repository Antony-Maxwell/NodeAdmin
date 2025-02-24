const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true,
    trim: true
  },
  product_description: {
    type: String,
    required: true
  },
  product_act_price: {
    type: String,
    required: true
  },
  product_sell_price: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  product_sub_images: [{
    type: String
  }],
  is_color_available: {
    type: String,
    required: true
  },
  product_colors: [{
    type: String
  }],
  is_size_available: {
    type: String,
    required: true
  },
  size_in_measurment: {
    type: String,
    required: true
  },
  product_size: [{
    type: String
  }],
  product_category: {
    type: String,
    required: false
  },
  product_brand: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);