const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { paymentLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const { createOrderSchema } = require("../validations/schemas");
const orderService = require("../services/orderService");

// POST /create-order - Create new orders
router.post(
  "/create-order",
  isAuthenticated,
  paymentLimiter,
  validate(createOrderSchema),
  catchAsyncErrors(async (req, res) => {
    const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;
    const orders = await orderService.createOrder({
      cart,
      shippingAddress,
      user: user || {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      totalPrice,
      paymentInfo,
    });

    res.status(201).json({
      success: true,
      orders,
    });
  })
);

// GET /get-all-orders/:userId - User orders
router.get(
  "/get-all-orders/:userId",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const orders = await orderService.getUserOrders(
      req.params.userId,
      req.user._id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      orders,
    });
  })
);

// GET /get-seller-all-orders/:shopId - Seller orders
router.get(
  "/get-seller-all-orders/:shopId",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const orders = await orderService.getSellerOrders(
      req.params.shopId,
      req.seller._id
    );
    res.status(200).json({
      success: true,
      orders,
    });
  })
);

// PUT /update-order-status/:id - Update order status (seller only)
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.seller._id,
      req.body.status
    );
    res.status(200).json({
      success: true,
      order,
    });
  })
);

// PUT /order-refund/:id - Request refund (user)
router.put(
  "/order-refund/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const order = await orderService.requestRefund(
      req.params.id,
      req.user._id,
      req.body.status
    );
    res.status(200).json({
      success: true,
      order,
      message: "Order Refund Request submitted successfully!",
    });
  })
);

// PUT /order-refund-success/:id - Process refund success (seller)
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    await orderService.processRefundSuccess(req.params.id, req.body.status);
    res.status(200).json({
      success: true,
      message: "Order Refund processed successfully!",
    });
  })
);

// GET /admin-all-orders - All orders for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res) => {
    const orders = await orderService.getAdminAllOrders();
    res.status(200).json({
      success: true,
      orders,
    });
  })
);

module.exports = router;
