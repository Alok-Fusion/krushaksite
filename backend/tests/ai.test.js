require("./setup");
const request = require("supertest");
const app = require("../app");

describe("AI Crop Disease & Assistant Routes Tests", () => {
  describe("POST /api/ai/disease & /api/v2/ai/disease", () => {
    it("should reject request without image payload", async () => {
      const res = await request(app)
        .post("/api/v2/ai/disease")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("image");
    });

    it("should reject invalid image format", async () => {
      const res = await request(app)
        .post("/api/v2/ai/disease")
        .send({
          image: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Unsupported image format");
    });
  });

  describe("POST /api/v2/ai/chat", () => {
    it("should reject chat request without question message", async () => {
      const res = await request(app)
        .post("/api/v2/ai/chat")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("question");
    });
  });
});
