const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

function loadEnv() {
  const envCandidates = [
    path.resolve(__dirname, "../.env"),
    path.resolve(__dirname, ".env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "config/.env"),
  ];

  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      try {
        const parsed = dotenv.parse(fs.readFileSync(envPath));
        for (const [key, value] of Object.entries(parsed)) {
          // If not set, or set to empty string, set it from the parsed file
          if (!process.env[key] || process.env[key].trim() === "") {
            process.env[key] = (value || "").trim();
          }
        }
      } catch (e) {
        // Silently continue if a file cannot be read
      }
    }
  }

  // Auto-configure Cloudinary once env is loaded
  try {
    const cloudinary = require("cloudinary");
    const cloudName = (process.env.CLOUDINARY_NAME || "").trim();
    const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
    const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      cloudinary.v2.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  } catch (err) {
    // Cloudinary SDK might not be loaded yet in minimal test runs
  }
}

loadEnv();

module.exports = loadEnv;
