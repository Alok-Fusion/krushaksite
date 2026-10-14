const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const {
  registerShopSchema,
  loginShopSchema,
  activationSchema,
} = require("../validations/schemas");
const sendShopToken = require("../utils/shopToken");
const { getRequestedLang } = require("../utils/applyTranslations");
const shopService = require("../services/shopService");

// POST /create-shop - Register shop
router.post(
  "/create-shop",
  authLimiter,
  validate(registerShopSchema),
  catchAsyncErrors(async (req, res) => {
    const result = await shopService.registerShop(req.body);
    res.status(201).json({
      success: true,
      ...result,
    });
  })
);

// POST /activation - Activate shop
router.post(
  "/activation",
  authLimiter,
  validate(activationSchema),
  catchAsyncErrors(async (req, res) => {
    const seller = await shopService.activateShop(req.body.activation_token);
    sendShopToken(seller, 201, res);
  })
);

// POST /login-shop - Login shop
router.post(
  "/login-shop",
  authLimiter,
  validate(loginShopSchema),
  catchAsyncErrors(async (req, res) => {
    const { email, password } = req.body;
    const seller = await shopService.loginShop(email, password);
    sendShopToken(seller, 200, res);
  })
);

// GET /getSeller - Load current seller profile
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const targetLang = getRequestedLang(req);
    const seller = await shopService.getShopById(req.seller._id, targetLang);
    res.status(200).json({
      success: true,
      seller,
    });
  })
);

// GET /logout - Logout seller
router.get(
  "/logout",
  catchAsyncErrors(async (req, res) => {
    res.cookie("seller_token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({
      success: true,
      message: "Log out successful!",
    });
  })
);

// GET /get-shop-info/:id - Public shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res) => {
    const targetLang = getRequestedLang(req);
    const shop = await shopService.getPublicShopInfo(req.params.id, targetLang);
    res.status(200).json({
      success: true,
      shop,
    });
  })
);

// PUT /update-shop-avatar - Update shop avatar
router.put(
  "/update-shop-avatar",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const seller = await shopService.updateAvatar(req.seller._id, req.body.avatar);
    res.status(200).json({
      success: true,
      seller,
    });
  })
);

// PUT /update-seller-info - Update shop details
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const shop = await shopService.updateShopInfo(req.seller._id, req.body);
    res.status(200).json({
      success: true,
      shop,
    });
  })
);

// GET /admin-all-sellers - Admin get all sellers
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res) => {
    const targetLang = getRequestedLang(req);
    const sellers = await shopService.getAllSellers(targetLang);
    res.status(200).json({
      success: true,
      sellers,
    });
  })
);

// DELETE /delete-seller/:id - Admin delete seller
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res) => {
    const result = await shopService.deleteSellerByAdmin(req.params.id);
    res.status(200).json(result);
  })
);

// PUT /update-payment-methods - Update withdrawal payment method
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const seller = await shopService.updatePaymentMethods(req.seller._id, req.body.withdrawMethod);
    res.status(200).json({
      success: true,
      seller,
    });
  })
);

// DELETE /delete-withdraw-method - Delete withdrawal payment method
router.delete(
  "/delete-withdraw-method",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const seller = await shopService.deletePaymentMethod(req.seller._id);
    res.status(200).json({
      success: true,
      seller,
    });
  })
);

module.exports = router;
