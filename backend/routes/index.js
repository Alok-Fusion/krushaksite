const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const shopRoutes = require("./shopRoutes");
const productRoutes = require("./productRoutes");
const paymentRoutes = require("./paymentRoutes");
const orderRoutes = require("./orderRoutes");
const conversationRoutes = require("./conversationRoutes");
const messageRoutes = require("./messageRoutes");
const withdrawRoutes = require("./withdrawRoutes");
const landRoutes = require("./landRoutes");
const aiRoutes = require("./aiRoutes");
const translationRoutes = require("./translationRoutes");

/**
 * Register all API v2 routes
 */
function registerRoutes(app) {
  // v2 API Route Mounts
  app.use("/api/v2/user", userRoutes);
  app.use("/api/v2/shop", shopRoutes);
  app.use("/api/v2/product", productRoutes);
  app.use("/api/v2/payment", paymentRoutes);
  app.use("/api/v2/order", orderRoutes);
  app.use("/api/v2/conversation", conversationRoutes);
  app.use("/api/v2/message", messageRoutes);
  app.use("/api/v2/withdraw", withdrawRoutes);
  app.use("/api/v2/lands", landRoutes);
  app.use("/api/v2/ai", aiRoutes);
  app.use("/api/v2/translations", translationRoutes);

  // Backward-compatibility aliases
  app.use("/api/ai", aiRoutes);
  app.use("/api/translations", translationRoutes);
}

module.exports = {
  registerRoutes,
  userRoutes,
  shopRoutes,
  productRoutes,
  paymentRoutes,
  orderRoutes,
  conversationRoutes,
  messageRoutes,
  withdrawRoutes,
  landRoutes,
  aiRoutes,
  translationRoutes,
};
