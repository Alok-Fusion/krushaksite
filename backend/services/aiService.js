const { GoogleGenerativeAI } = require("@google/generative-ai");
const { z } = require("zod");
const ErrorHandler = require("../utils/ErrorHandler");
const { detectLang, translateChatMessage } = require("../utils/translate");

// Schemas
const diseaseResultSchema = z.object({
  crop: z.string().default("Unknown Crop"),
  disease: z.string().default("Unknown Condition"),
  confidence: z.string().default("N/A"),
  severity: z.string().default("Unknown"),
  causes: z.array(z.string()).default([]),
  treatment: z.array(z.string()).default([]),
  prevention: z.array(z.string()).default([]),
});

const normalizeResultSchema = z.object({
  keyword: z.string().min(1),
});

class AIService {
  constructor() {
    this.forecastCache = new Map();
    this.CACHE_TTL_MS = 5 * 60 * 1000;
    this.messageTranslationCache = new Map();
    this.MSG_CACHE_MAX = 500;
  }

  getCachedForecast(key) {
    const cached = this.forecastCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }
    this.forecastCache.delete(key);
    return null;
  }

  setCachedForecast(key, data) {
    this.forecastCache.set(key, { data, timestamp: Date.now() });
    if (this.forecastCache.size > 200) {
      const oldest = this.forecastCache.keys().next().value;
      this.forecastCache.delete(oldest);
    }
  }

  parseImageData(dataUrlOrBase64) {
    let mimeType = "image/jpeg";
    let base64Data = dataUrlOrBase64;

    if (dataUrlOrBase64.startsWith("data:")) {
      const match = dataUrlOrBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!match) {
        throw new ErrorHandler("Invalid base64 image data URL format", 400);
      }
      mimeType = match[1];
      base64Data = match[2];
    }

    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedMimes.includes(mimeType.toLowerCase())) {
      throw new ErrorHandler(`Unsupported image format (${mimeType}). Please upload JPEG, PNG, or WebP.`, 400);
    }

    const estimatedSizeInBytes = (base64Data.length * 3) / 4;
    const maxSizeBytes = 10 * 1024 * 1024;
    if (estimatedSizeInBytes > maxSizeBytes) {
      throw new ErrorHandler("Image size exceeds the 10MB limit. Please upload a smaller image.", 400);
    }

    return { mimeType, base64Data };
  }

  /**
   * Detect plant disease using Gemini Vision
   */
  async detectDisease(image, language = "en") {
    if (!image) {
      throw new ErrorHandler("Please provide an image of the crop leaf", 400);
    }

    const parsedImage = this.parseImageData(image);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ErrorHandler("Gemini API key is not configured. Please set GEMINI_API_KEY in the server environment.", 503);
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
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      jsonResult = JSON.parse(cleaned);
    }

    return diseaseResultSchema.parse(jsonResult);
  }

  /**
   * Krushak Assistant specialized agricultural chatbot
   */
  async chatWithAssistant(message, conversationHistory = [], language = "en") {
    if (!message || typeof message !== "string" || !message.trim()) {
      throw new ErrorHandler("Please provide a question for the assistant", 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ErrorHandler("Gemini API key is not configured. Please set GEMINI_API_KEY in the server environment.", 503);
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    });

    const formattedHistory = conversationHistory
      .filter((item) => item.role && item.text)
      .slice(-10)
      .map((item) => ({
        role: item.role === "user" ? "user" : "model",
        parts: [{ text: item.text }],
      }));

    const chat = model.startChat({ history: formattedHistory });
    const response = await chat.sendMessage(message.trim());
    return response.response.text();
  }

  /**
   * Normalize voice query into clean English keyword
   */
  async normalizeVoiceQuery(transcript, language = "en-IN") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { keyword: transcript, fallback: true };
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
Return JSON object: {"keyword": "<english crop or product name>"}`;

      const result = await model.generateContent(prompt);
      const parsedJson = JSON.parse(result.response.text());
      const validated = normalizeResultSchema.safeParse(parsedJson);

      if (validated.success && validated.data.keyword) {
        return { keyword: validated.data.keyword.trim().toLowerCase(), fallback: false };
      }
      return { keyword: transcript, fallback: true };
    } catch (e) {
      return { keyword: transcript, fallback: true };
    }
  }

  /**
   * Get price forecast with caching & ML proxy
   */
  async getPriceForecast(crop, market, days) {
    const cacheKey = `${crop.toLowerCase()}_${market.toLowerCase()}_${days}`;
    const cachedData = this.getCachedForecast(cacheKey);

    if (cachedData) {
      return { cached: true, ...cachedData };
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
        throw new ErrorHandler(
          errJson.detail || `ML forecasting service error: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      this.setCachedForecast(cacheKey, data);
      return { cached: false, ...data };
    } catch (err) {
      if (err instanceof ErrorHandler) throw err;
      throw new ErrorHandler(
        `Unable to reach Mandi Forecaster ML service: ${err.message}. Please start the ML service with: cd ml-service && uvicorn main:app --port 8001`,
        503
      );
    }
  }

  /**
   * On-demand translation for chat messages
   */
  async translateChatMessage(messageId, text, targetLang = "en") {
    if (!text || typeof text !== "string" || !text.trim()) {
      throw new ErrorHandler("Text to translate is required", 400);
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 1000) {
      throw new ErrorHandler("Message length exceeds maximum limit of 1000 characters", 400);
    }

    const validLangs = ["en", "hi", "mr"];
    if (!validLangs.includes(targetLang.toLowerCase())) {
      throw new ErrorHandler("Invalid target language. Supported: en, hi, mr", 400);
    }

    const normalizedTarget = targetLang.toLowerCase();
    const cacheKey = `${messageId || trimmedText}_${normalizedTarget}`;

    if (this.messageTranslationCache.has(cacheKey)) {
      const cached = this.messageTranslationCache.get(cacheKey);
      return {
        text: cached.text,
        translatedFrom: cached.translatedFrom,
        cached: true,
      };
    }

    const detectedSource = detectLang(trimmedText);
    if (detectedSource === normalizedTarget) {
      return {
        text: trimmedText,
        translatedFrom: detectedSource,
      };
    }

    const result = await translateChatMessage(trimmedText, normalizedTarget);

    this.messageTranslationCache.set(cacheKey, {
      text: result.text,
      translatedFrom: result.translatedFrom,
      timestamp: Date.now(),
    });

    if (this.messageTranslationCache.size > this.MSG_CACHE_MAX) {
      const oldestKey = this.messageTranslationCache.keys().next().value;
      this.messageTranslationCache.delete(oldestKey);
    }

    return {
      text: result.text,
      translatedFrom: result.translatedFrom,
    };
  }
}

module.exports = new AIService();
