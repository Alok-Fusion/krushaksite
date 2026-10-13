require("./setup");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const Order = require("../model/order");
const User = require("../model/user");

jest.mock("../model/order");
jest.mock("../model/user");

describe("Order Route Security & Validation Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v2/order/create-order", () => {
    it("should reject order creation if unauthenticated", async () => {
      const res = await request(app)
        .post("/api/v2/order/create-order")
        .send({
          cart: [{ _id: "p1", name: "Wheat Seed", qty: 2, discountPrice: 200, shopId: "s1" }],
          shippingAddress: { address1: "Village Farm, Plot 4", city: "Nagpur" },
          totalPrice: 400,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject order creation with empty cart", async () => {
      const validToken = jwt.sign(
        { id: "user_123" },
        process.env.JWT_SECRET_KEY
      );

      User.findById = jest.fn().mockResolvedValue({
        _id: "user_123",
        name: "Test Farmer",
        email: "farmer@krushak.test",
        role: "user",
      });

      const res = await request(app)
        .post("/api/v2/order/create-order")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          cart: [],
          shippingAddress: { address1: "Farm Road" },
          totalPrice: 100,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Validation failed");
    });
  });

  describe("GET /api/v2/order/get-all-orders/:userId", () => {
    it("should reject unauthenticated order access", async () => {
      const res = await request(app).get("/api/v2/order/get-all-orders/user_123");
      expect(res.status).toBe(401);
    });
  });
});
