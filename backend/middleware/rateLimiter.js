const rateLimit = require("express-rate-limit");

// General limiter for standard API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication, registration, activation
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // strict limit on sensitive auth attempts
  message: {
    success: false,
    message: "Too many authentication attempts from this IP, please try again in 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for payment transactions
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // strict limit on checkout / payment intents
  message: {
    success: false,
    message: "Too many payment requests from this IP, please try again in 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for AI features (Disease Detection & Assistant)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25,
  message: {
    success: false,
    message: "AI service rate limit reached. Please wait a few minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  aiLimiter,
};
