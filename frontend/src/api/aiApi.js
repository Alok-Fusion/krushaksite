import apiClient from "./client";

export const aiApi = {
  detectDisease: (image, language = "en") =>
    apiClient.post("/ai/disease", { image, language }),
  chat: (message, conversationHistory = [], language = "en") =>
    apiClient.post("/ai/chat", { message, conversationHistory, language }),
  normalizeQuery: (transcript, language = "en-IN") =>
    apiClient.post("/ai/normalize-query", { transcript, language }),
  getForecast: (crop, market, days = 7) =>
    apiClient.get("/ai/forecast", { params: { crop, market, days } }),
  getCrops: () => apiClient.get("/ai/crops"),
  getMarkets: () => apiClient.get("/ai/markets"),
  translateMessage: (messageId, text, targetLang = "en") =>
    apiClient.post("/ai/translate-message", { messageId, text, targetLang }),
};

export default aiApi;
