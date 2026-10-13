const path = require("path");

// config - load environment variables
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: path.resolve(__dirname, "config/.env"),
  });
  require("dotenv").config({
    path: path.resolve(__dirname, ".env"),
  });
}

const app = require("./app");
const connectDatabase = require("./db/Database");
const cloudinary = require("cloudinary");

// Handling uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server for handling uncaught exception`);
  process.exit(1);
});

// connect db
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 8000;

// create server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the server for ${err.message}`);
  console.log(`Shutting down the server for unhandled promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
