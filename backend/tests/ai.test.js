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

  describe("POST /api/ai/normalize-query & /api/v2/ai/normalize-query", () => {
    it("should reject missing transcript", async () => {
      const res = await request(app)
        .post("/api/ai/normalize-query")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Transcript");
    });

    it("should reject transcript exceeding 200 characters", async () => {
      const longText = "a".repeat(201);
      const res = await request(app)
        .post("/api/ai/normalize-query")
        .send({ transcript: longText });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("200 characters");
    });

    it("should fallback to raw transcript when API key is missing or calls fallback", async () => {
      const res = await request(app)
        .post("/api/ai/normalize-query")
        .send({ transcript: "कांदा", language: "mr-IN" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.keyword).toBeDefined();
    });
  });
});

