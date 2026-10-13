const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Product = require("../model/product");
const Order = require("../model/order");
const Shop = require("../model/shop");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const validate = require("../middleware/validate");
const { createProductSchema } = require("../validations/schemas");

// create product --- only seller
router.post(
  "/create-product",
  isSeller,
  validate(createProductSchema),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId || req.seller._id.toString();
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      }

      // Ensure seller matches authenticated seller
      if (req.seller._id.toString() !== shop._id.toString()) {
        return next(new ErrorHandler("You can only create products for your own shop!", 403));
      }

      let images = [];
      if (typeof req.body.images === "string") {
        images.push(req.body.images);
      } else if (Array.isArray(req.body.images)) {
        images = req.body.images;
      }

      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        if (images[i].startsWith("data:") || images[i].startsWith("http")) {
          const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
          });
          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        } else {
          imagesLinks.push({
            public_id: `product_${Date.now()}_${i}`,
            url: images[i],
          });
        }
      }

      const productData = { ...req.body };
      productData.shopId = shop._id.toString();
      productData.images = imagesLinks;
      productData.shop = shop;

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all products of a shop
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// delete product of a shop
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        return next(new ErrorHandler("Product not found with this id", 404));
      }

      // Check seller ownership
      if (product.shopId !== req.seller._id.toString()) {
        return next(
          new ErrorHandler("You are not authorized to delete this product", 403)
        );
      }

      // Destroy cloudinary images safely
      if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
          const publicId = product.images[i]?.public_id;
          if (publicId && !publicId.startsWith("product_")) {
            await cloudinary.v2.uploader.destroy(publicId);
          }
        }
      }

      await Product.findByIdAndDelete(productId);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all products with pagination, search, category, and price filters
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 0; // 0 means return all for backward compatibility
      const search = req.query.search || req.query.keyword || "";
      const category = req.query.category || "";
      const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
      const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ];
      }

      if (category && category !== "All") {
        query.category = category;
      }

      if (minPrice !== null || maxPrice !== null) {
        query.discountPrice = {};
        if (minPrice !== null) query.discountPrice.$gte = minPrice;
        if (maxPrice !== null) query.discountPrice.$lte = maxPrice;
      }

      const totalProducts = await Product.countDocuments(query);

      let queryExec = Product.find(query).sort({ createdAt: -1 });

      if (limit > 0) {
        const skip = (page - 1) * limit;
        queryExec = queryExec.skip(skip).limit(limit);
      }

      const products = await queryExec;

      res.status(200).json({
        success: true,
        products,
        totalProducts,
        totalPages: limit > 0 ? Math.ceil(totalProducts / limit) : 1,
        currentPage: page,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// review for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      if (!productId || !rating) {
        return next(new ErrorHandler("Product ID and rating are required", 400));
      }

      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      const review = {
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar,
        },
        rating: Number(rating),
        comment,
        productId,
        createdAt: new Date(),
      };

      const existingIndex = product.reviews.findIndex(
        (rev) => rev.user?._id?.toString() === req.user._id.toString()
      );

      if (existingIndex !== -1) {
        product.reviews[existingIndex].rating = rating;
        product.reviews[existingIndex].comment = comment;
      } else {
        product.reviews.push(review);
      }

      let avg = 0;
      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      product.ratings = product.reviews.length > 0 ? avg / product.reviews.length : 0;

      await product.save({ validateBeforeSave: false });

      if (orderId) {
        await Order.findByIdAndUpdate(
          orderId,
          { $set: { "cart.$[elem].isReviewed": true } },
          { arrayFilters: [{ "elem._id": productId }], new: true }
        );
      }

      res.status(200).json({
        success: true,
        message: "Reviewed successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// all products --- for admin
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find().sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
