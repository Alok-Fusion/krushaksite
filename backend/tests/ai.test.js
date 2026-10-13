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

  describe("GET /api/ai/forecast & /api/v2/ai/forecast", () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it("should reject request with missing crop parameter", async () => {
      const res = await request(app)
        .get("/api/ai/forecast")
        .query({ market: "Lasalgaon", days: 7 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Crop");
    });

    it("should reject request with missing market parameter", async () => {
      const res = await request(app)
        .get("/api/ai/forecast")
        .query({ crop: "onion", days: 7 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Market");
    });

    it("should reject invalid forecast horizon days", async () => {
      const res = await request(app)
        .get("/api/ai/forecast")
        .query({ crop: "onion", market: "Lasalgaon", days: 15 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Days");
    });

    it("should proxy forecast response and cache subsequent identical requests", async () => {
      let fetchCalls = 0;
      global.fetch = jest.fn().mockImplementation(async (url) => {
        fetchCalls++;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            crop: "potato",
            market: "Pune",
            days: 7,
            data_source: "synthetic",
            latest_price: 1800,
            forecast: [
              { date: "2026-10-14", predicted_price: 1820, lower_bound: 1750, upper_bound: 1890 },
            ],
            history: [],
            plain_language_hint: "Prices expected to hold steady",
          }),
        };
      });

      // First call -> cache miss
      const res1 = await request(app)
        .get("/api/ai/forecast")
        .query({ crop: "potato", market: "Pune", days: 7 });

      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.cached).toBe(false);
      expect(res1.body.latest_price).toBe(1800);
      expect(fetchCalls).toBe(1);

      // Second call -> cache hit
      const res2 = await request(app)
        .get("/api/ai/forecast")
        .query({ crop: "potato", market: "Pune", days: 7 });

      expect(res2.status).toBe(200);
      expect(res2.body.success).toBe(true);
      expect(res2.body.cached).toBe(true);
      expect(fetchCalls).toBe(1); // fetch was NOT called again
    });
  });
});


