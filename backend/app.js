require("./config/loadEnv");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const ErrorHandler = require("./middleware/error");
const { generalLimiter } = require("./middleware/rateLimiter");

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration with allowed-origins env var
const defaultOrigins = ["http://localhost:3000", "http://localhost:3001"];
const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. mobile, tests, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(
        new Error(`Origin ${origin} not allowed by CORS policy`),
        false
      );
    },
    credentials: true,
  })
);

// Capture raw body for Stripe webhook verification
app.use(
  express.json({
    limit: "50mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Rate limit general API requests
app.use("/api/", generalLimiter);

// Health test route
app.get("/test", (req, res) => {
  res.status(200).json({ status: "ok", message: "Krushak API is operational" });
});

// Modularized Route Mounts
const { registerRoutes } = require("./routes");
registerRoutes(app);

// Centralized error handling
app.use(ErrorHandler);

module.exports = app;
