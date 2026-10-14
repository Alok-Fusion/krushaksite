const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createProductSchema } = require("../validations/schemas");
const { getRequestedLang } = require("../utils/applyTranslations");
const productService = require("../services/productService");

// POST /create-product - Create a new product listing (seller only)
router.post(
  "/create-product",
  isSeller,
  validate(createProductSchema),
  catchAsyncErrors(async (req, res) => {
    const product = await productService.createProduct(req.body, req.seller);
    res.status(201).json({
      success: true,
      product,
    });
  })
);

// GET /get-all-products-shop/:id - All products of a specific shop
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res) => {
    const targetLang = getRequestedLang(req);
    const products = await productService.getShopProducts(req.params.id, targetLang);
    res.status(200).json({
      success: true,
      products,
    });
  })
);

// GET /get-product/:id - Single product by ID
router.get(
  "/get-product/:id",
  catchAsyncErrors(async (req, res) => {
    const targetLang = getRequestedLang(req);
    const product = await productService.getProductById(req.params.id, targetLang);
    res.status(200).json({
      success: true,
      product,
    });
  })
);

// DELETE /delete-shop-product/:id - Delete product (seller only)
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const result = await productService.deleteProduct(req.params.id, req.seller._id);
    res.status(200).json(result);
  })
);

// GET /get-all-products - Query all products with pagination, category, price, and search
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 0;
    const search = req.query.search || req.query.keyword || "";
    const category = req.query.category || "";
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

    const targetLang = getRequestedLang(req);
    const result = await productService.getAllProducts(
      { page, limit, search, category, minPrice, maxPrice },
      targetLang
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  })
);

// PUT /create-new-review - Add or update product review
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const { rating, comment, productId, orderId } = req.body;
    const result = await productService.addReview({
      user: req.user,
      rating,
      comment,
      productId,
      orderId,
    });
    res.status(200).json(result);
  })
);

// GET /admin-all-products - All products for admin
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res) => {
    const targetLang = getRequestedLang(req);
    const products = await productService.getAdminAllProducts(targetLang);
    res.status(200).json({
      success: true,
      products,
    });
  })
);

module.exports = router;
