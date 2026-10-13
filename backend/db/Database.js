const mongoose = require("mongoose");

const connectDatabase = () => {
  const dbUrl =
    process.env.DB_URL &&
    (process.env.DB_URL.startsWith("mongodb://") ||
      process.env.DB_URL.startsWith("mongodb+srv://"))
      ? process.env.DB_URL
      : "mongodb://127.0.0.1:27017/krushak";

  mongoose
    .connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`MongoDB connected with host: ${data.connection.host}`);
    })
    .catch((err) => {
      console.error(
        `MongoDB connection failed (${err.message}). If using Atlas or a remote database, ensure DB_URL in backend/config/.env is set to a valid mongodb+srv:// connection string.`
      );
    });
};

module.exports = connectDatabase;
