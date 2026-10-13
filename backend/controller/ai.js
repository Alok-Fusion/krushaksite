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

module.exports = router;
