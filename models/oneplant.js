const mongoose = require("mongoose");

const onePlantSchema = new mongoose.Schema({
  location_id: {
    type: String,
    required: true,
  },
  displayname: {
    type: String,
    required: true,
  },
  variationid: {
    type: Number,
    required: true,
  },
  variation: {
    type: String,
    required: true,
  },
  equivalent: {
    type: Number,
    required: true,
  },
  packsize: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: String | null,
    required: false,
  },
  discountPercent: {
    type: String | null,
    required: false,
  },
  onsale: {
    type: String,
    required: false,
  },
  quantityStatus: {
    type: String,
    required: false,
  },
  memberDiscountPercent: {
    type: String,
    required: false,
  },
  memberPrice: {
    type: Number,
    required: true,
  },
  promo: {
    type: String,
    required: false,
  },
  memberPromoName: {
    type: String,
    required: false,
  },
  featured: {
    type: String,
    required: false,
  },
  loyalty: {
    type: String | null,
    required: false,
  },
  productName: {
    type: String,
    required: true,
  },
  brandname: {
    type: String,
    required: true,
  },

  priceHistory: {
    type: Map,
    required: true,
  },
  memberPriceHistory: {
    type: Map,
    required: true,
  },
  priceHistoryUpdatedAt: {
    type: Date,
    required: false,
  },
  memberPriceHistoryUpdatedAt: {
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

module.exports = mongoose.model("OnePlant", onePlantSchema);
