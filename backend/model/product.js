const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your product name!"],
  },
  description: {
    type: String,
    required: [true, "Please enter your product description!"],
  },
  category: {
    type: String,
    required: [true, "Please enter your product category!"],
  },
  tags: {
    type: String,
  },
  discountPrice: {
    type: Number,
    required: [true, "Please enter your product price!"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter your product stock!"],
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  reviews: [
    {
      user: {
        type: Object,
      },
      rating: {
        type: Number,
      },
      comment: {
        type: String,
      },
      productId: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      translations: {
        en: { type: Object, default: {} },
        hi: { type: Object, default: {} },
        mr: { type: Object, default: {} },
      },
      sourceLang: {
        type: String,
        enum: ["en", "hi", "mr"],
        default: "en",
      },
      sourceHash: {
        type: String,
        default: "",
      },
      edited: {
        en: { type: Boolean, default: false },
        hi: { type: Boolean, default: false },
        mr: { type: Boolean, default: false },
      },
    },
  ],
  ratings: {
    type: Number,
  },
  shopId: {
    type: String,
    required: true,
  },
  shop: {
    type: Object,
    required: true,
  },
  sold_out: {
    type: Number,
    default: 0,
  },
  translations: {
    en: { type: Object, default: {} },
    hi: { type: Object, default: {} },
    mr: { type: Object, default: {} },
  },
  sourceLang: {
    type: String,
    enum: ["en", "hi", "mr"],
    default: "en",
  },
  sourceHash: {
    type: String,
    default: "",
  },
  edited: {
    en: { type: Boolean, default: false },
    hi: { type: Boolean, default: false },
    mr: { type: Boolean, default: false },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
