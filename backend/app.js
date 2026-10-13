const path = require("path");

// Load environment variables early
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: path.resolve(__dirname, "config/.env"),
  });
  require("dotenv").config({
    path: path.resolve(__dirname, ".env"),
  });
}

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

// Import controllers
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const payment = require("./controller/payment");
const order = require("./controller/order");
const conversation = require("./controller/conversation");
const message = require("./controller/message");
const withdraw = require("./controller/withdraw");
const lands = require("./controller/lands");
const ai = require("./controller/ai");

// Route mounts
app.use("/api/v2/user", user);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);
app.use("/api/v2/order", order);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/payment", payment);
app.use("/api/v2/withdraw", withdraw);
app.use("/api/v2/lands", lands);
app.use("/api/v2/ai", ai);
app.use("/api/ai", ai); // alias for /api/ai/disease and /api/ai/chat

// Centralized error handling
app.use(ErrorHandler);

module.exports = app;
