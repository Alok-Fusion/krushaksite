const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated } = require("../middleware/auth");
const { paymentLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const { processPaymentSchema } = require("../validations/schemas");
const paymentService = require("../services/paymentService");

// POST /process - Create PaymentIntent
router.post(
  "/process",
  paymentLimiter,
  isAuthenticated,
  validate(processPaymentSchema),
  catchAsyncErrors(async (req, res) => {
    const { amount } = req.body;
    const payment = await paymentService.createPaymentIntent(
      amount,
      req.user?._id || "guest"
    );
    res.status(200).json({
      success: true,
      client_secret: payment.client_secret,
      id: payment.id,
    });
  })
);

// GET /stripeapikey - Get publishable stripe key
router.get(
  "/stripeapikey",
  catchAsyncErrors(async (req, res) => {
    const stripeApikey = paymentService.getStripeApiKey();
    res.status(200).json({ stripeApikey });
  })
);

// POST /webhook - Stripe webhook
router.post(
  "/webhook",
  catchAsyncErrors(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const result = await paymentService.handleWebhook(req.rawBody, req.body, sig);
    res.status(200).json(result);
  })
);

// GET /verify/:id - Verify payment status
router.get(
  "/verify/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const result = await paymentService.verifyPayment(req.params.id);
    res.status(200).json({
      success: true,
      ...result,
    });
  })
);

module.exports = router;
