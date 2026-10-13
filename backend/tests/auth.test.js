require("./setup");
const request = require("supertest");
const app = require("../app");
const User = require("../model/user");

jest.mock("../model/user");
jest.mock("../utils/sendMail", () => jest.fn().mockResolvedValue(true));

describe("Auth & User Route Security Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /test", () => {
    it("should return operational health status", async () => {
      const res = await request(app).get("/test");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });

  describe("POST /api/v2/user/create-user", () => {
    it("should fail validation when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/v2/user/create-user")
        .send({
          email: "invalid-email",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Validation failed");
    });

    it("should reject registration if user email already exists", async () => {
      User.findOne.mockResolvedValue({ _id: "existing_id", email: "farmer@krushak.org" });

      const res = await request(app)
        .post("/api/v2/user/create-user")
        .send({
          name: "Ramesh Kumar",
          email: "farmer@krushak.org",
          password: "password123",
          phoneNumber: 9876543210,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already exists");
    });
  });

  describe("POST /api/v2/user/login-user", () => {
    it("should reject login without credentials", async () => {
      const res = await request(app)
        .post("/api/v2/user/login-user")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject non-existent user login", async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post("/api/v2/user/login-user")
        .send({
          phoneNumber: 9999999999,
          password: "testpassword",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v2/user/getuser", () => {
    it("should block unauthenticated access with 401", async () => {
      const res = await request(app).get("/api/v2/user/getuser");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Please login to continue");
    });
  });
});
