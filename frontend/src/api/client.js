import axios from "axios";
import { server } from "../server";

/**
 * Production-grade Centralized API Client
 * - Sets credentials
 * - Injects current language header and query parameter
 * - Formats and logs errors consistently
 */
const apiClient = axios.create({
  baseURL: server,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const lang = localStorage.getItem("krushak_lang") || "en";
    config.headers["Accept-Language"] = lang;

    // Attach lang query param to GET requests if not already explicitly provided
    if (config.method === "get" && config.params?.lang === undefined) {
      config.params = { ...config.params, lang };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const message =
      error.response?.data?.message || error.message || "An unexpected error occurred";

    // Handle token expiration or unauthorized redirects if appropriate
    if (status === 401 && window.location.pathname.startsWith("/dashboard")) {
      // Seller session expired
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
