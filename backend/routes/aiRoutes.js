const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { aiLimiter } = require("../middleware/rateLimiter");
const aiService = require("../services/aiService");
const ErrorHandler = require("../utils/ErrorHandler");
const { z } = require("zod");

const normalizeQuerySchema = z.object({
  transcript: z
    .string({ message: "Transcript is required" })
    .trim()
    .min(1, "Transcript cannot be empty")
    .max(200, "Transcript must not exceed 200 characters"),
  language: z.string().optional().default("en-IN"),
});

const forecastQuerySchema = z.object({
  crop: z
    .string({ message: "Crop is required" })
    .trim()
    .min(1, "Crop parameter cannot be empty"),
  market: z
    .string({ message: "Market is required" })
    .trim()
    .min(1, "Market parameter cannot be empty"),
  days: z.coerce
    .number({ message: "Days must be a number" })
    .int()
    .refine((val) => val === 7 || val === 30, {
      message: "Days parameter must be either 7 or 30",
    })
    .default(7),
});

// POST /disease - Crop disease detection
router.post(
  "/disease",
  aiLimiter,
  catchAsyncErrors(async (req, res) => {
    const { image, language = "en" } = req.body;
    const data = await aiService.detectDisease(image, language);
    res.status(200).json({
      success: true,
      data,
    });
  })
);

// POST /chat - Krushak Assistant chatbot
router.post(
  "/chat",
  aiLimiter,
  catchAsyncErrors(async (req, res) => {
    const { message, conversationHistory = [], language = "en" } = req.body;
    const reply = await aiService.chatWithAssistant(message, conversationHistory, language);
    res.status(200).json({
      success: true,
      reply,
    });
  })
);

// POST /normalize-query - Normalize voice search query
router.post(
  "/normalize-query",
  aiLimiter,
  catchAsyncErrors(async (req, res, next) => {
    const parseResult = normalizeQuerySchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(
        new ErrorHandler(
          parseResult.error.issues[0]?.message || "Invalid query data",
          400
        )
      );
    }
    const { transcript, language } = parseResult.data;
    const result = await aiService.normalizeVoiceQuery(transcript, language);
    res.status(200).json({
      success: true,
      ...result,
    });
  })
);

// GET /forecast - Price forecast proxy with caching
router.get(
  "/forecast",
  aiLimiter,
  catchAsyncErrors(async (req, res, next) => {
    const parseResult = forecastQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return next(
        new ErrorHandler(
          parseResult.error.issues[0]?.message || "Invalid forecast query parameters",
          400
        )
      );
    }
    const { crop, market, days } = parseResult.data;
    const forecast = await aiService.getPriceForecast(crop, market, days);
    res.status(200).json({
      success: true,
      ...forecast,
    });
  })
);

// GET /crops - Supported crops
router.get(
  "/crops",
  catchAsyncErrors(async (req, res) => {
    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8001";
    try {
      const response = await fetch(`${mlServiceUrl}/crops`);
      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({ success: true, ...data });
      }
    } catch (e) {
      // Fallback
    }
    res.status(200).json({
      success: true,
      crops: ["onion", "tomato", "potato", "wheat", "soybean", "cotton", "maize", "tur"],
    });
  })
);

// GET /markets - Supported markets
router.get(
  "/markets",
  catchAsyncErrors(async (req, res) => {
    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8001";
    try {
      const response = await fetch(`${mlServiceUrl}/markets`);
      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({ success: true, ...data });
      }
    } catch (e) {
      // Fallback
    }
    res.status(200).json({
      success: true,
      markets: ["Lasalgaon", "Pune", "Nashik", "Nagpur", "Kolhapur", "Latur"],
    });
  })
);

// POST /translate-message - On-demand chat message translation
router.post(
  "/translate-message",
  aiLimiter,
  catchAsyncErrors(async (req, res) => {
    const { messageId, text, targetLang = "en" } = req.body;
    const result = await aiService.translateChatMessage(messageId, text, targetLang);
    res.status(200).json({
      success: true,
      ...result,
    });
  })
);

module.exports = router;
