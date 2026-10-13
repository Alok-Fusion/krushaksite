const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { aiLimiter } = require("../middleware/rateLimiter");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { z } = require("zod");

// Schema to validate structured disease response
const diseaseResultSchema = z.object({
  crop: z.string().default("Unknown Crop"),
  disease: z.string().default("Unknown Condition"),
  confidence: z.string().default("N/A"),
  severity: z.string().default("Unknown"),
  causes: z.array(z.string()).default([]),
  treatment: z.array(z.string()).default([]),
  prevention: z.array(z.string()).default([]),
});


// Schema to validate voice query normalization input
const normalizeQuerySchema = z.object({
  transcript: z
    .string({ message: "Transcript is required" })
    .trim()
    .min(1, "Transcript cannot be empty")
    .max(200, "Transcript must not exceed 200 characters"),
  language: z.string().optional().default("en-IN"),
});

const normalizeResultSchema = z.object({
  keyword: z.string().min(1),
});

// Validation schema for forecast query
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

// In-memory forecast cache (TTL = 5 minutes)
const forecastCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCachedForecast(key) {
  const cached = forecastCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  forecastCache.delete(key);
  return null;
}

function setCachedForecast(key, data) {
  forecastCache.set(key, { data, timestamp: Date.now() });
  if (forecastCache.size > 200) {
    const oldest = forecastCache.keys().next().value;
    forecastCache.delete(oldest);
  }
}

// Helper to extract clean base64 data and mime type
function parseImageData(dataUrlOrBase64) {
  let mimeType = "image/jpeg";
  let base64Data = dataUrlOrBase64;

  if (dataUrlOrBase64.startsWith("data:")) {
    const match = dataUrlOrBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!match) {
      throw new Error("Invalid base64 image data URL format");
    }
    mimeType = match[1];
    base64Data = match[2];
  }

  // Validate MIME type
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedMimes.includes(mimeType.toLowerCase())) {
    throw new Error(`Unsupported image format (${mimeType}). Please upload JPEG, PNG, or WebP.`);
  }

  // Estimate file size (base64 length * 0.75 gives approximate bytes)
  const estimatedSizeInBytes = (base64Data.length * 3) / 4;
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit
  if (estimatedSizeInBytes > maxSizeBytes) {
    throw new Error("Image size exceeds the 10MB limit. Please upload a smaller image.");
  }

  return { mimeType, base64Data };
}

// POST /api/v2/ai/disease - Detect crop diseases from leaf photo
router.post(
  "/disease",
  aiLimiter,
  catchAsyncErrors(async (req, res, next) => {
    const { image, language = "en" } = req.body;

    if (!image) {
      return next(new ErrorHandler("Please provide an image of the crop leaf", 400));
    }

    let parsedImage;
    try {
      parsedImage = parseImageData(image);
    } catch (parseErr) {
      return next(new ErrorHandler(parseErr.message, 400));
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return next(
        new ErrorHandler(
          "Gemini API key is not configured. Please set GEMINI_API_KEY in the server environment.",
          503
        )
      );
    }

    const languageDirectives = {
      en: "Provide all diagnosis fields, causes, treatment steps, and prevention instructions in English.",
      hi: "Provide the diagnosis, causes, treatment steps, and prevention instructions in clear Hindi (हिन्दी) using Devanagari script.",
      mr: "Provide the diagnosis, causes, treatment steps, and prevention instructions in clear Marathi (मराठी) using Devanagari script.",
    };

    const languageInstruction = languageDirectives[language] || languageDirectives.en;

    const systemPrompt = `You are Krushak AI, an expert botanical pathologist and precision agronomist specialized in Indian agriculture and crop diseases.
Analyze the provided leaf or plant image and return a structured JSON assessment of its health condition.

${languageInstruction}

Strictly output ONLY a JSON object conforming to this exact structure:
{
  "crop": "Name of the crop/plant (e.g., Tomato, Rice, Wheat, Cotton, Corn)",
  "disease": "Identified disease or 'Healthy Crop' or 'Not a Crop/Plant'",
  "confidence": "Estimated confidence percentage (e.g. 94%)",
  "severity": "Mild" | "Moderate" | "Severe" | "Healthy" | "None",
  "causes": ["List 2-4 primary causes, fungal/bacterial/viral agents, or environmental stressors"],
  "treatment": ["List 2-4 immediate, actionable treatment steps, biological remedies, or chemical controls with dosage guidance"],
  "prevention": ["List 2-4 preventative farming practices, crop rotation, soil management, or resistant varieties"]
}

If the image is not a plant or leaf, set crop to 'Unknown', disease to 'Not a Crop Leaf', severity to 'None', and advise uploading a leaf photo.`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const imagePart = {
        inlineData: {
          data: parsedImage.base64Data,
          mimeType: parsedImage.mimeType,
        },
      };

      const result = await model.generateContent([systemPrompt, imagePart]);
      const responseText = result.response.text();

      let jsonResult;
      try {
        jsonResult = JSON.parse(responseText);
      } catch (parseError) {
        // Fallback cleanup if response contains markdown wraps
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        jsonResult = JSON.parse(cleaned);
      }

      // Validate structured response
      const validatedResult = diseaseResultSchema.parse(jsonResult);

      res.status(200).json({
        success: true,
        data: validatedResult,
      });
    } catch (apiError) {
      console.error("Gemini Vision API error:", apiError.message);
      return next(
        new ErrorHandler(
          `Crop disease analysis failed: ${apiError.message || "Unable to process image"}`,
          500
        )
      );
    }
  })
);

// POST /api/v2/ai/chat - Krushak Assistant specialized agricultural chatbot
router.post(
  "/chat",
  aiLimiter,
  catchAsyncErrors(async (req, res, next) => {
    const { message, conversationHistory = [], language = "en" } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return next(new ErrorHandler("Please provide a question for the assistant", 400));
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return next(
        new ErrorHandler(
          "Gemini API key is not configured. Please set GEMINI_API_KEY in the server environment.",
          503
        )
      );
    }

    const targetLang =
      language === "hi"
        ? "Hindi (हिन्दी)"
        : language === "mr"
        ? "Marathi (मराठी)"
        : "English";

    const systemInstruction = `You are Krushak Krishi Mitra (कृषक कृषि मित्र), an empathetic and expert agricultural AI advisor for Indian farmers.
You provide practical, scientifically sound advice on:
- Sowing seasons, high-yield seed varieties, organic farming (Jeevarmrut, neem oil)
- Fertilizer application ratios (NPK, DAP, Urea) and soil nutrition
- Irrigation management (drip, sprinkler), pest prevention, and monsoon precautions
- Mandi price navigation, storage best practices, and Indian government schemes (PM-KISAN, PM Fasal Bima Yojana)

IMPORTANT GUARDRAIL:
You are strictly an agriculture and farming assistant. If the user asks questions unrelated to agriculture, crops, farming, rural livelihoods, or livestock, politely decline and steer the conversation back to agricultural topics.
Always respond in ${targetLang}. Keep your tone supportive, practical, and clear.`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      });

      // Format conversation history
      const formattedHistory = conversationHistory
        .filter((item) => item.role && item.text)
        .slice(-10) // Keep last 10 messages for context
        .map((item) => ({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      const response = await chat.sendMessage(message.trim());
      const reply = response.response.text();

      res.status(200).json({
        success: true,
        reply,
      });
    } catch (chatError) {
      console.error("Gemini Chat API error:", chatError.message);
      return next(
        new ErrorHandler(
          `Krushak Assistant request failed: ${chatError.message || "Failed to generate reply"}`,
          500
        )
      );
    }
  })
);


// POST /api/v2/ai/normalize-query - Normalize voice search query to English keyword
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
    const apiKey = process.env.GEMINI_API_KEY;

    // Fall back to raw transcript if no API key configured
    if (!apiKey) {
      return res.status(200).json({
        success: true,
        keyword: transcript,
        fallback: true,
      });
    }

    const langMap = {
      "hi-IN": "Hindi",
      "hi": "Hindi",
      "mr-IN": "Marathi",
      "mr": "Marathi",
      "en-IN": "Indian English",
      "en": "English",
    };
    const langDesc = langMap[language] || "Hindi/Marathi/English";

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      const prompt = `You are a query normalizer for an Indian agriculture marketplace (Krushak).
A user spoke this search query in ${langDesc}:
"${transcript}"

Extract ONLY the primary crop, product, seed, fertilizer, or agricultural search term in clean lowercase English.
Examples:
- "मुझे ताजा प्याज चाहिए" -> {"keyword": "onion"}
- "कांदा दर काय आहे" -> {"keyword": "onion"}
- "गव्हाचे बियाणे" -> {"keyword": "wheat"}
- "युरिया खत उपलब्ध आहे का" -> {"keyword": "urea"}
- "tamatar" -> {"keyword": "tomato"}
- "tractor" -> {"keyword": "tractor"}

Return JSON object: {"keyword": "<english crop or product name>"}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsedJson = JSON.parse(responseText);
      const validated = normalizeResultSchema.safeParse(parsedJson);

      if (validated.success && validated.data.keyword) {
        return res.status(200).json({
          success: true,
          keyword: validated.data.keyword.trim().toLowerCase(),
        });
      }

      return res.status(200).json({
        success: true,
        keyword: transcript,
        fallback: true,
      });
    } catch (error) {
      console.warn("Gemini normalize-query error, falling back to raw transcript:", error.message);
      return res.status(200).json({
        success: true,
        keyword: transcript,
        fallback: true,
      });
    }
  })
);
// GET /api/v2/ai/forecast & /api/ai/forecast - Proxy to ML service with caching & rate limiting
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
    const cacheKey = `${crop.toLowerCase()}_${market.toLowerCase()}_${days}`;
    const cachedData = getCachedForecast(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        cached: true,
        ...cachedData,
      });
    }

    const rawUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:8001";
    const mlServiceUrl = rawUrl.replace("://localhost:", "://127.0.0.1:");
    const targetUrl = `${mlServiceUrl}/forecast?crop=${encodeURIComponent(crop)}&market=${encodeURIComponent(market)}&days=${days}`;

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return next(
          new ErrorHandler(
            errJson.detail || `ML forecasting service error: ${response.statusText}`,
            response.status
          )
        );
      }

      const data = await response.json();
      setCachedForecast(cacheKey, data);

      return res.status(200).json({
        success: true,
        cached: false,
        ...data,
      });
    } catch (err) {
      return next(
        new ErrorHandler(
          `Unable to reach Mandi Forecaster ML service: ${err.message}. Please start the ML service with: cd ml-service && uvicorn main:app --port 8001`,
          503
        )
      );
    }
  })
);

// GET /crops - List supported mandi crops
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
      // Fallback default crop list
    }
    return res.status(200).json({
      success: true,
      crops: ["onion", "tomato", "potato", "wheat", "soybean", "cotton", "maize", "tur"],
    });
  })
);

// GET /markets - List supported Maharashtra APMC mandis
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
      // Fallback default markets list
    }
    return res.status(200).json({
      success: true,
      markets: ["Lasalgaon", "Pune", "Nashik", "Nagpur", "Kolhapur", "Latur"],
    });
  })
);

// In-memory cache for chat message translations: key -> { text, translatedFrom, timestamp }
const messageTranslationCache = new Map();
const MSG_CACHE_MAX = 500;

// POST /translate-message - On-demand translation for chat messages
router.post(
  "/translate-message",
  aiLimiter,
  catchAsyncErrors(async (req, res, next) => {
    const { messageId, text, targetLang = "en" } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return next(new ErrorHandler("Text to translate is required", 400));
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 1000) {
      return next(
        new ErrorHandler("Message length exceeds maximum limit of 1000 characters", 400)
      );
    }

    const validLangs = ["en", "hi", "mr"];
    if (!validLangs.includes(targetLang.toLowerCase())) {
      return next(
        new ErrorHandler("Invalid target language. Supported: en, hi, mr", 400)
      );
    }

    const normalizedTarget = targetLang.toLowerCase();
    const cacheKey = `${messageId || trimmedText}_${normalizedTarget}`;

    // Check in-memory cache
    if (messageTranslationCache.has(cacheKey)) {
      const cached = messageTranslationCache.get(cacheKey);
      return res.status(200).json({
        success: true,
        text: cached.text,
        translatedFrom: cached.translatedFrom,
        cached: true,
      });
    }

    const { detectLang, translateChatMessage } = require("../utils/translate");
    const detectedSource = detectLang(trimmedText);

    if (detectedSource === normalizedTarget) {
      return res.status(200).json({
        success: true,
        text: trimmedText,
        translatedFrom: detectedSource,
      });
    }

    const result = await translateChatMessage(trimmedText, normalizedTarget);

    // Cache translated message
    messageTranslationCache.set(cacheKey, {
      text: result.text,
      translatedFrom: result.translatedFrom,
      timestamp: Date.now(),
    });

    if (messageTranslationCache.size > MSG_CACHE_MAX) {
      const oldestKey = messageTranslationCache.keys().next().value;
      messageTranslationCache.delete(oldestKey);
    }

    res.status(200).json({
      success: true,
      text: result.text,
      translatedFrom: result.translatedFrom,
    });
  })
);

module.exports = router;

