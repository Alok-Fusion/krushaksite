require("./setup");
const request = require("supertest");
const app = require("../app");
const Product = require("../model/product");

jest.mock("../model/product");

describe("Product Routes & Query Filtering Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v2/product/get-all-products", () => {
    it("should return products list with pagination metadata", async () => {
      const mockProducts = [
        { _id: "prod_1", name: "Organic Wheat Seeds", discountPrice: 450, category: "Seeds" },
        { _id: "prod_2", name: "Bio Fertilizer NPK", discountPrice: 650, category: "Fertilizer" },
      ];

      Product.countDocuments = jest.fn().mockResolvedValue(2);
      Product.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProducts),
      });

      const res = await request(app).get("/api/v2/product/get-all-products");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBe(2);
      expect(res.body.totalProducts).toBe(2);
    });

    it("should support query filters by category and search keyword", async () => {
      Product.countDocuments = jest.fn().mockResolvedValue(1);
      Product.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              { _id: "prod_1", name: "Wheat Seeds", category: "Seeds" },
            ]),
          }),
        }),
      });

      const res = await request(app)
        .get("/api/v2/product/get-all-products")
        .query({ category: "Seeds", search: "Wheat", page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Product.find).toHaveBeenCalled();
    });
  });

  describe("POST /api/v2/product/create-product", () => {
    it("should reject product creation without seller authentication", async () => {
      const res = await request(app)
        .post("/api/v2/product/create-product")
        .send({
          name: "High Yield Corn Seeds",
          description: "Premium hybrid seeds",
          category: "Seeds",
          discountPrice: 320,
          stock: 50,
          shopId: "shop_123",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("seller");
    });
  });
});
