const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");

// Verify logged-in regular user
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler("User not found or session expired", 401));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired session token", 401));
  }
});

// Verify logged-in seller/shop
exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  const seller_token =
    req.cookies?.seller_token ||
    req.headers["x-seller-token"] ||
    (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!seller_token) {
    return next(new ErrorHandler("Please login to continue as seller", 401));
  }

  try {
    const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
    req.seller = await Shop.findById(decoded.id);

    if (!req.seller) {
      return next(new ErrorHandler("Seller not found or session expired", 401));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired seller token", 401));
  }
});

// Verify admin role
exports.isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user?.role || "User"} is not authorized to access this resource!`,
          403
        )
      );
    }
    next();
  };
};

// Verify either user or seller
exports.isAuthenticatedOrSeller = catchAsyncErrors(async (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  const sellerToken =
    req.cookies?.seller_token ||
    req.headers["x-seller-token"];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (_) {}
  }

  if (sellerToken) {
    try {
      const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET_KEY);
      const seller = await Shop.findById(decoded.id);
      if (seller) {
        req.seller = seller;
        return next();
      }
    } catch (_) {}
  }

  return next(new ErrorHandler("Authentication required", 401));
});