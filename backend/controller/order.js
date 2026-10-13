const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { paymentLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const { createOrderSchema } = require("../validations/schemas");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// create new order
router.post(
  "/create-order",
  isAuthenticated,
  paymentLimiter,
  validate(createOrderSchema),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

      // Server-side payment verification for card payments
      if (paymentInfo && (paymentInfo.type === "Credit Card" || paymentInfo.type === "Stripe")) {
        if (!paymentInfo.id) {
          return next(
            new ErrorHandler("Payment identifier is required for card checkout", 400)
          );
        }

        try {
          const intent = await stripe.paymentIntents.retrieve(paymentInfo.id);
          if (intent.status !== "succeeded") {
            return next(
              new ErrorHandler(`Payment not confirmed by Stripe (Status: ${intent.status})`, 400)
            );
          }
          paymentInfo.status = "Succeeded";
        } catch (stripeErr) {
          return next(
            new ErrorHandler(`Stripe verification failed: ${stripeErr.message}`, 400)
          );
        }
      }

      // Group cart items by shopId
      const shopItemsMap = new Map();

      for (const item of cart) {
        const shopId = item.shopId;
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId).push(item);
      }

      // Create an order for each shop
      const orders = [];

      for (const [shopId, items] of shopItemsMap) {
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user: user || {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
          },
          totalPrice,
          paymentInfo,
          paidAt: paymentInfo?.status === "Succeeded" ? new Date() : undefined,
        });
        orders.push(order);
      }

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of user
router.get(
  "/get-all-orders/:userId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Ensure user only fetches their own orders unless admin
      if (
        req.user._id.toString() !== req.params.userId &&
        req.user.role !== "Admin"
      ) {
        return next(
          new ErrorHandler("You are not authorized to view these orders", 403)
        );
      }

      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      if (req.seller._id.toString() !== req.params.shopId) {
        return next(
          new ErrorHandler("You are not authorized to view orders of another shop", 403)
        );
      }

      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update order status for seller
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      if (req.body.status === "Transferred to delivery partner") {
        for (const o of order.cart) {
          await updateProductStock(o._id, o.qty);
        }
      }

      order.status = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        const serviceCharge = order.totalPrice * 0.1;
        await creditSellerBalance(req.seller._id, order.totalPrice - serviceCharge);
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
      });

      async function updateProductStock(id, qty) {
        const product = await Product.findById(id);
        if (product) {
          product.stock -= qty;
          product.sold_out += qty;
          await product.save({ validateBeforeSave: false });
        }
      }

      async function creditSellerBalance(sellerId, amount) {
        const seller = await Shop.findById(sellerId);
        if (seller) {
          seller.availableBalance = (seller.availableBalance || 0) + amount;
          await seller.save();
        }
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// request refund ----- user
router.put(
  "/order-refund/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      if (order.user?._id?.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Not authorized to refund this order", 403));
      }

      order.status = req.body.status || "Processing refund";
      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order Refund Request submitted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// accept refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      order.status = req.body.status || "Refund Success";
      await order.save();

      if (req.body.status === "Refund Success") {
        for (const o of order.cart) {
          const product = await Product.findById(o._id);
          if (product) {
            product.stock += o.qty;
            product.sold_out = Math.max(0, product.sold_out - o.qty);
            await product.save({ validateBeforeSave: false });
          }
        }
      }

      res.status(200).json({
        success: true,
        message: "Order Refund processed successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
