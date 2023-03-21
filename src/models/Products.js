const mongoose = require("mongoose");

const ProductsSchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true,
  },
  brandname: {
    type: String,
    required: true,
  },
  location_id: {
    type: String,
    required: true,
  },
  displayname: {
    type: String,
    required: true,
  },
  product_id: {
    type: String,
    required: true,
  },
  variationid: {
    type: String,
    required: true,
  },
  variation_name: {
    type: String,
    required: true,
  },
  total_size: {
    type: Number,
    required: true,
  },
  pack_size: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  quantityStatus: {
    type: String,
    required: false,
  },
  promoPrice: {
    type: Number,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  priceHistory: {
    type: Map,
    required: true,
  },
  promoPriceHistory: {
    type: Map,
    required: true,
  },
  priceHistoryUpdatedAt: {
    type: Date,
    required: false,
  },
  promoPriceHistoryUpdatedAt: {
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Product", ProductsSchema);
