const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated } = require("../middleware/auth");
const { paymentLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const { processPaymentSchema } = require("../validations/schemas");
const Order = require("../model/order");
const ErrorHandler = require("../utils/ErrorHandler");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Process payment - create PaymentIntent
router.post(
  "/process",
  paymentLimiter,
  isAuthenticated,
  validate(processPaymentSchema),
  catchAsyncErrors(async (req, res, next) => {
    const { amount } = req.body;

    const myPayment = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "inr",
      metadata: {
        company: "Krushak",
        userId: req.user?._id ? req.user._id.toString() : "guest",
      },
    });

    res.status(200).json({
      success: true,
      client_secret: myPayment.client_secret,
      id: myPayment.id,
    });
  })
);

// Get publishable stripe key
router.get(
  "/stripeapikey",
  catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ stripeApikey: process.env.STRIPE_API_KEY });
  })
);

// Server-side Stripe Webhook verification
router.post(
  "/webhook",
  catchAsyncErrors(async (req, res, next) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (webhookSecret && sig) {
      try {
        const payload = req.rawBody || Buffer.from(JSON.stringify(req.body));
        event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
      } catch (err) {
        return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
      }
    } else {
      // In development when webhook signing secret is not configured
      event = req.body;
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      // Find order matching this paymentIntent id and mark it as confirmed
      const order = await Order.findOne({
        "paymentInfo.id": paymentIntent.id,
      });

      if (order) {
        order.paymentInfo.status = "Succeeded";
        order.paidAt = new Date();
        await order.save();
      }
    }

    res.status(200).json({ received: true });
  })
);

// Verify payment status server-side directly with Stripe
router.get(
  "/verify/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
      res.status(200).json({
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

module.exports = router;