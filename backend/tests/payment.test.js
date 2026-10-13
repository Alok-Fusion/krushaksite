require("./setup");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const Order = require("../model/order");
const User = require("../model/user");

jest.mock("../model/order");
jest.mock("../model/user");

describe("Payment & Stripe Webhook Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v2/payment/stripeapikey", () => {
    it("should return the Stripe API publishable key", async () => {
      const res = await request(app).get("/api/v2/payment/stripeapikey");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("stripeApikey");
    });
  });

  describe("POST /api/v2/payment/process", () => {
    it("should block unauthenticated payment requests", async () => {
      const res = await request(app)
        .post("/api/v2/payment/process")
        .send({ amount: 5000 });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should validate that amount is a positive number", async () => {
      const validToken = jwt.sign(
        { id: "user_123" },
        process.env.JWT_SECRET_KEY
      );

      User.findById = jest.fn().mockResolvedValue({
        _id: "user_123",
        name: "Test Farmer",
        email: "farmer@krushak.test",
      });

      const res = await request(app)
        .post("/api/v2/payment/process")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: -50 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Validation failed");
    });
  });

  describe("POST /api/v2/payment/webhook", () => {
    it("should acknowledge incoming Stripe webhook events", async () => {
      Order.findOne = jest.fn().mockResolvedValue({
        _id: "order_123",
        paymentInfo: { id: "pi_test_123", status: "Processing" },
        save: jest.fn().mockResolvedValue(true),
      });

      const mockEvent = {
        id: "evt_test",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_123",
            amount: 50000,
            status: "succeeded",
          },
        },
      };

      const res = await request(app)
        .post("/api/v2/payment/webhook")
        .send(mockEvent);

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
    });
  });
});
