const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Invalid MongoDB ObjectId (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found with invalid identifier: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // MongoDB Duplicate Key Error (11000)
  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyValue || {}).join(", ");
    const message = `Duplicate field value entered: ${duplicateFields}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(", ");
    err = new ErrorHandler(`Validation Error: ${messages}`, 400);
  }

  // Invalid JSON Syntax Error in body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    err = new ErrorHandler("Malformed JSON payload in request body", 400);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("Invalid session token, please login again", 401);
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("Your session has expired, please login again", 401);
  }

  const response = {
    success: false,
    message: err.message,
    statusCode: err.statusCode,
  };

  if (process.env.NODE_ENV !== "PRODUCTION" && process.env.NODE_ENV !== "test") {
    response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
};
