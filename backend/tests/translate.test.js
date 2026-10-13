require("./setup");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const app = require("../app");
const {
  computeSourceHash,
  detectLang,
  translateFields,
  translateChatMessage,
} = require("../utils/translate");
const { translationQueue } = require("../utils/translationQueue");
const Product = require("../model/product");
const Lands = require("../model/lands");
const Shop = require("../model/shop");

// Mock @google/generative-ai
jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockImplementation(() => ({
        generateContent: jest.fn(),
      })),
    })),
  };
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

describe("Multilingual Translation Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = "test_gemini_api_key";
  });

  describe("1. translate.js Unit Tests", () => {
    it("should compute deterministic source hash regardless of key order", () => {
      const hash1 = computeSourceHash({
        name: "Wheat Seeds",
        description: "High yield Sharbati wheat",
      });
      const hash2 = computeSourceHash({
        description: "High yield Sharbati wheat",
        name: "Wheat Seeds",
      });
      expect(hash1).toBeDefined();
      expect(hash1).toBe(hash2);
    });

    it("should detect language correctly for en, hi, mr", () => {
      expect(detectLang("High quality organic fertilizer")).toBe("en");
      expect(detectLang("उच्च गुणवत्ता वाला जैविक खाद और बीज")).toBe("hi");
      expect(detectLang("उत्कृष्ट दर्जाचे सेंद्रिय खत आणि बियाणे आहे शेतकरी")).toBe("mr");
      expect(detectLang("कांदा आणि बटाटा भाव")).toBe("mr"); // Marathi marker आणि
    });

    it("should preserve brand names and variety names in translation", async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              name: "पूसा बासमती (Pusa Basmati)",
              description: "बायेर (Bayer) कंपनीचे दर्जेदार बियाणे",
            }),
        },
      });

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: mockGenerateContent,
        }),
      }));

      const fields = {
        name: "Pusa Basmati",
        description: "Quality seeds from Bayer",
      };

      const result = await translateFields(fields, "en", "mr");

      expect(mockGenerateContent).toHaveBeenCalled();
      expect(result.name).toContain("Pusa Basmati");
      expect(result.description).toContain("Bayer");
    });

    it("should gracefully handle invalid JSON from Gemini and fall back to original text", async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => "{ invalid json response from model",
        },
      });

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: mockGenerateContent,
        }),
      }));

      const originalFields = {
        name: "Hybrid Tomato Seeds",
        description: "Resistant to leaf curl virus",
      };

      const result = await translateFields(originalFields, "en", "hi");

      // Verify fallback to original text without throwing
      expect(result).toEqual(originalFields);
    });

    it("should fall back to original text when Gemini API throws an exception", async () => {
      const mockGenerateContent = jest
        .fn()
        .mockRejectedValue(new Error("Gemini quota exceeded or network error"));

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: mockGenerateContent,
        }),
      }));

      const originalFields = {
        name: "DAP Fertilizer",
        description: "50kg bag of fertilizer",
      };

      const result = await translateFields(originalFields, "en", "mr");
      expect(result).toEqual(originalFields);
    });

    it("should fall back to original text when GEMINI_API_KEY is missing", async () => {
      delete process.env.GEMINI_API_KEY;

      const originalFields = {
        name: "Urea 45kg",
        description: "Standard nitrogen fertilizer",
      };

      const result = await translateFields(originalFields, "en", "hi");
      expect(result).toEqual(originalFields);
    });
  });

  describe("2. Translation Queue & Skip Logic", () => {
    it("should never overwrite translations when edited is true for that language", async () => {
      const mockProduct = {
        _id: "prod_123",
        name: "Wheat Grain",
        description: "Freshly harvested wheat",
        category: "Grains",
        tags: "wheat",
        sourceLang: "en",
        sourceHash: "old_hash",
        translations: {
          en: { name: "Wheat Grain", description: "Freshly harvested wheat" },
          hi: { name: "कस्टम गेहूं", description: "किसान द्वारा संपादित विवरण" },
          mr: {},
        },
        edited: {
          en: false,
          hi: true, // MANUALLY EDITED BY SELLER
          mr: false,
        },
        markModified: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Product, "findById").mockResolvedValue(mockProduct);

      // Execute translation job
      await translationQueue.executeJob({
        modelType: "product",
        documentId: "prod_123",
      });

      // Hindi translation MUST remain untouched
      expect(mockProduct.translations.hi.name).toBe("कस्टम गेहूं");
      expect(mockProduct.translations.hi.description).toBe("किसान द्वारा संपादित विवरण");
    });

    it("should skip translation when sourceHash is unchanged and translation already exists", async () => {
      const fields = {
        name: "Cotton",
        description: "Long staple cotton",
        category: "Crops",
        tags: "cotton",
      };
      const existingHash = computeSourceHash(fields);

      const mockProduct = {
        _id: "prod_cotton",
        ...fields,
        sourceLang: "en",
        sourceHash: existingHash,
        translations: {
          en: fields,
          hi: { name: "कपास", description: "लंबे रेशे वाली कपास" },
          mr: { name: "कापूस", description: "लांब धाग्याचा कापूस" },
        },
        edited: { en: false, hi: false, mr: false },
        markModified: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Product, "findById").mockResolvedValue(mockProduct);

      const mockGenerateContent = jest.fn();
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: mockGenerateContent,
        }),
      }));

      await translationQueue.executeJob({
        modelType: "product",
        documentId: "prod_cotton",
      });

      // No new translation API calls should be triggered because hash is unchanged
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });
  });

  describe("3. GET Endpoints ?lang Parameter Overlay", () => {
    it("should overlay translated fields when ?lang=hi is requested", async () => {
      const mockProduct = {
        _id: "507f1f77bcf86cd799439011",
        name: "Organic Onion",
        description: "Fresh red onions directly from farm",
        category: "Vegetables",
        discountPrice: 25,
        sourceLang: "en",
        translations: {
          hi: {
            name: "जैविक प्याज",
            description: "खेत से सीधे ताजा लाल प्याज",
          },
          mr: {
            name: "सेंद्रिय कांदा",
            description: "शेतकऱ्यांकडून थेट ताजा लाल कांदा",
          },
        },
        toObject: function () {
          return {
            _id: this._id,
            name: this.name,
            description: this.description,
            category: this.category,
            discountPrice: this.discountPrice,
            sourceLang: this.sourceLang,
            translations: this.translations,
          };
        },
      };

      jest.spyOn(Product, "findById").mockResolvedValue(mockProduct);

      const res = await request(app)
        .get(`/api/v2/product/get-product/${mockProduct._id}`)
        .query({ lang: "hi" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product.name).toBe("जैविक प्याज");
      expect(res.body.product.description).toBe("खेत से सीधे ताजा लाल प्याज");
      expect(res.body.product.isTranslated).toBe(true);
      expect(res.body.product.original.name).toBe("Organic Onion");
    });

    it("should fall back to original text when translation for requested language is missing", async () => {
      const mockProduct = {
        _id: "507f1f77bcf86cd799439012",
        name: "Sunflower Seeds",
        description: "High oil content sunflower seeds",
        sourceLang: "en",
        translations: {},
        toObject: function () {
          return {
            _id: this._id,
            name: this.name,
            description: this.description,
            sourceLang: this.sourceLang,
            translations: this.translations,
          };
        },
      };

      jest.spyOn(Product, "findById").mockResolvedValue(mockProduct);

      const res = await request(app)
        .get(`/api/v2/product/get-product/${mockProduct._id}`)
        .query({ lang: "mr" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product.name).toBe("Sunflower Seeds");
      expect(res.body.product.isTranslated).toBe(false);
    });
  });

  describe("4. PUT /api/translations/:model/:id/:lang Ownership & Auth Checks", () => {
    const sellerId = "607f1f77bcf86cd799439022";
    const otherSellerId = "607f1f77bcf86cd799439099";

    const sellerToken = jwt.sign({ id: sellerId }, process.env.JWT_SECRET_KEY);

    it("should reject unauthenticated translation edit requests with 401", async () => {
      const res = await request(app)
        .put("/api/translations/product/507f1f77bcf86cd799439011/hi")
        .send({ name: "नया नाम" });

      expect(res.status).toBe(401);
    });

    it("should reject unauthorized seller trying to edit another seller's product with 403", async () => {
      jest.spyOn(Shop, "findById").mockResolvedValue({
        _id: sellerId,
        role: "Seller",
      });

      const mockProduct = {
        _id: "507f1f77bcf86cd799439011",
        shopId: otherSellerId, // Belongs to a DIFFERENT seller!
        translations: {},
        edited: {},
      };

      jest.spyOn(Product, "findById").mockResolvedValue(mockProduct);

      const res = await request(app)
        .put(`/api/translations/product/${mockProduct._id}/hi`)
        .set("Cookie", [`seller_token=${sellerToken}`])
        .send({
          fields: {
            name: "अनाधिकृत संपादन",
          },
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("not authorized");
    });

    it("should allow verified owner to edit translation and set edited: true", async () => {
      jest.spyOn(Shop, "findById").mockResolvedValue({
        _id: sellerId,
        role: "Seller",
      });

      const mockProduct = {
        _id: "507f1f77bcf86cd799439011",
        shopId: sellerId, // OWNER MATCHES!
        translations: { en: {}, hi: {}, mr: {} },
        edited: { en: false, hi: false, mr: false },
        markModified: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Product, "findById").mockResolvedValue(mockProduct);

      const res = await request(app)
        .put(`/api/translations/product/${mockProduct._id}/mr`)
        .set("Cookie", [`seller_token=${sellerToken}`])
        .send({
          fields: {
            name: "शेतातील ताजा कांदा",
            description: "उत्कृष्ट दर्जाचा नाशिक कांदा",
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.translations.mr.name).toBe("शेतातील ताजा कांदा");
      expect(res.body.edited.mr).toBe(true);
      expect(mockProduct.save).toHaveBeenCalled();
    });
  });

  describe("5. POST /api/ai/translate-message On-Demand Chat Translation", () => {
    it("should reject message length exceeding 1000 characters with 400", async () => {
      const longMessage = "a".repeat(1001);
      const res = await request(app)
        .post("/api/ai/translate-message")
        .send({
          text: longMessage,
          targetLang: "hi",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("1000 characters");
    });

    it("should translate message on demand and return text and translatedFrom", async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              message: "कांद्याचा प्रति क्विंटल दर काय आहे?",
            }),
        },
      });

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: mockGenerateContent,
        }),
      }));

      const res = await request(app)
        .post("/api/ai/translate-message")
        .send({
          messageId: "msg_test_1",
          text: "What is the price per quintal for onion?",
          targetLang: "mr",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.text).toBe("कांद्याचा प्रति क्विंटल दर काय आहे?");
      expect(res.body.translatedFrom).toBe("en");
    });

    it("should return cached translation on subsequent calls for same message", async () => {
      const resCached = await request(app)
        .post("/api/ai/translate-message")
        .send({
          messageId: "msg_test_1",
          text: "What is the price per quintal for onion?",
          targetLang: "mr",
        });

      expect(resCached.status).toBe(200);
      expect(resCached.body.cached).toBe(true);
      expect(resCached.body.text).toBe("कांद्याचा प्रति क्विंटल दर काय आहे?");
    });
  });
});
