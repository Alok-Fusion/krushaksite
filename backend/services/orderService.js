const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");
const ErrorHandler = require("../utils/ErrorHandler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class OrderService {
  /**
   * Helper to update product stock and sold count
   */
  async updateProductStock(productId, qtyChange, isIncrement = false) {
    const product = await Product.findById(productId);
    if (product) {
      if (isIncrement) {
        product.stock += qtyChange;
        product.sold_out = Math.max(0, (product.sold_out || 0) - qtyChange);
      } else {
        product.stock -= qtyChange;
        product.sold_out = (product.sold_out || 0) + qtyChange;
      }
      await product.save({ validateBeforeSave: false });
    }
  }

  /**
   * Helper to credit seller balance after platform commission (10%)
   */
  async creditSellerBalance(sellerId, amount) {
    const seller = await Shop.findById(sellerId);
    if (seller) {
      seller.availableBalance = (seller.availableBalance || 0) + amount;
      await seller.save();
    }
  }

  /**
   * Create new orders grouped by shop
   */
  async createOrder({ cart, shippingAddress, user, totalPrice, paymentInfo }) {
    // Server-side payment verification for card payments
    if (paymentInfo && (paymentInfo.type === "Credit Card" || paymentInfo.type === "Stripe")) {
      if (!paymentInfo.id) {
        throw new ErrorHandler("Payment identifier is required for card checkout", 400);
      }

      try {
        const intent = await stripe.paymentIntents.retrieve(paymentInfo.id);
        if (intent.status !== "succeeded") {
          throw new ErrorHandler(`Payment not confirmed by Stripe (Status: ${intent.status})`, 400);
        }
        paymentInfo.status = "Succeeded";
      } catch (stripeErr) {
        if (stripeErr instanceof ErrorHandler) throw stripeErr;
        throw new ErrorHandler(`Stripe verification failed: ${stripeErr.message}`, 400);
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
        user: user,
        totalPrice,
        paymentInfo,
        paidAt: paymentInfo?.status === "Succeeded" ? new Date() : undefined,
      });
      orders.push(order);
    }

    return orders;
  }

  /**
   * Get all orders of a user
   */
  async getUserOrders(userId, requestUserId, requestUserRole) {
    if (requestUserId.toString() !== userId && requestUserRole !== "Admin") {
      throw new ErrorHandler("You are not authorized to view these orders", 403);
    }
    return await Order.find({ "user._id": userId }).sort({ createdAt: -1 });
  }

  /**
   * Get all orders of a seller
   */
  async getSellerOrders(shopId, currentSellerId) {
    if (currentSellerId.toString() !== shopId) {
      throw new ErrorHandler("You are not authorized to view orders of another shop", 403);
    }
    return await Order.find({ "cart.shopId": shopId }).sort({ createdAt: -1 });
  }

  /**
   * Update order status by seller
   */
  async updateOrderStatus(orderId, sellerId, status) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ErrorHandler("Order not found with this id", 404);
    }

    if (status === "Transferred to delivery partner") {
      for (const item of order.cart) {
        await this.updateProductStock(item._id, item.qty, false);
      }
    }

    order.status = status;

    if (status === "Delivered") {
      order.deliveredAt = Date.now();
      if (!order.paymentInfo) order.paymentInfo = {};
      order.paymentInfo.status = "Succeeded";
      const serviceCharge = order.totalPrice * 0.1;
      await this.creditSellerBalance(sellerId, order.totalPrice - serviceCharge);
    }

    await order.save({ validateBeforeSave: false });
    return order;
  }

  /**
   * Submit refund request by user
   */
  async requestRefund(orderId, userId, status = "Processing refund") {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ErrorHandler("Order not found with this id", 404);
    }

    if (order.user?._id?.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to refund this order", 403);
    }

    order.status = status;
    await order.save({ validateBeforeSave: false });
    return order;
  }

  /**
   * Accept refund by seller and restore stock
   */
  async processRefundSuccess(orderId, status = "Refund Success") {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ErrorHandler("Order not found with this id", 404);
    }

    order.status = status;
    await order.save();

    if (status === "Refund Success") {
      for (const item of order.cart) {
        await this.updateProductStock(item._id, item.qty, true);
      }
    }

    return order;
  }

  /**
   * Admin: Get all orders across platform
   */
  async getAdminAllOrders() {
    return await Order.find().sort({ deliveredAt: -1, createdAt: -1 });
  }
}

module.exports = new OrderService();
