const Order = require("../model/order");
const ErrorHandler = require("../utils/ErrorHandler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  /**
   * Create Stripe PaymentIntent
   */
  async createPaymentIntent(amount, userId = "guest") {
    const payment = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "inr",
      metadata: {
        company: "Krushak",
        userId: userId.toString(),
      },
    });

    return {
      client_secret: payment.client_secret,
      id: payment.id,
    };
  }

  /**
   * Get Stripe Publishable Key
   */
  getStripeApiKey() {
    return process.env.STRIPE_API_KEY || "";
  }

  /**
   * Handle Stripe Webhook
   */
  async handleWebhook(rawBody, body, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    if (webhookSecret && signature) {
      const payload = rawBody || Buffer.from(JSON.stringify(body));
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } else {
      event = body;
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const order = await Order.findOne({
        "paymentInfo.id": paymentIntent.id,
      });

      if (order) {
        order.paymentInfo.status = "Succeeded";
        order.paidAt = new Date();
        await order.save();
      }
    }

    return { received: true };
  }

  /**
   * Verify Payment Status directly with Stripe
   */
  async verifyPayment(paymentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      };
    } catch (err) {
      throw new ErrorHandler(err.message, 400);
    }
  }
}

module.exports = new PaymentService();
