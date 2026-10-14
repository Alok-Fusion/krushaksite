require("./loadEnv");

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  PORT: parseInt(process.env.PORT, 10) || 8000,
  DB_URL: process.env.DB_URL || "mongodb://localhost:27017/krushak",
  JWT_SECRET: process.env.JWT_SECRET_KEY || "krushak_jwt_secret_key_change_in_production",
  JWT_EXPIRES: process.env.JWT_EXPIRES || "7d",
  ACTIVATION_SECRET: process.env.ACTIVATION_SECRET || "krushak_activation_secret_key",
  STRIPE_API_KEY: process.env.STRIPE_API_KEY || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:3000", "http://localhost:3001"],
  CLOUDINARY: {
    cloudName: process.env.CLOUDINARY_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  SMTP: {
    host: process.env.SMPT_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMPT_PORT, 10) || 465,
    service: process.env.SMPT_SERVICE || "gmail",
    mail: process.env.SMPT_MAIL || "",
    password: process.env.SMPT_PASSWORD || "",
  },
};

module.exports = env;
