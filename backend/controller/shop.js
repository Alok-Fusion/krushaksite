const express = require("express");
const path = require("path");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const Shop = require("../model/shop");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const {
  registerShopSchema,
  loginShopSchema,
  activationSchema,
} = require("../validations/schemas");
const cloudinary = require("cloudinary");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendShopToken = require("../utils/shopToken");
const { getRequestedLang, applyTranslations } = require("../utils/applyTranslations");
const { enqueueTranslation } = require("../utils/translationQueue");

// create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "15m",
  });
};

// create shop
router.post(
  "/create-shop",
  authLimiter,
  validate(registerShopSchema),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;
      const sellerEmail = await Shop.findOne({ email });
      if (sellerEmail) {
        return next(new ErrorHandler("Shop with this email already exists", 400));
      }

      let avatarData = {
        public_id: "default_avatar",
        url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      };

      if (req.body.avatar && req.body.avatar.length > 50) {
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
        });
        avatarData = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const seller = {
        name: req.body.name,
        email: email,
        password: req.body.password,
        avatar: avatarData,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        zipCode: req.body.zipCode,
      };

      const activationToken = createActivationToken(seller);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const activationUrl = `${frontendUrl}/seller/activation/${activationToken}`;

      try {
        await sendMail({
          email: seller.email,
          subject: "Activate your Krushak Seller Account",
          message: `Hello ${seller.name},\n\nPlease click on the following link to activate your seller account:\n${activationUrl}\n\nThis link expires in 15 minutes.`,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email (${seller.email}) to activate your shop!`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to send activation email", 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// activate shop
router.post(
  "/activation",
  authLimiter,
  validate(activationSchema),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler("Invalid or expired activation token", 400));
      }
      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;

      let seller = await Shop.findOne({ email });
      if (seller) {
        return next(new ErrorHandler("Shop already exists", 400));
      }

      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
      });

      sendShopToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message || "Activation failed", 500));
    }
  })
);

// login shop
router.post(
  "/login-shop",
  authLimiter,
  validate(loginShopSchema),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await Shop.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Shop doesn't exist with this email", 400));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Invalid credentials", 400));
      }

      sendShopToken(user, 200, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load shop
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);
      if (!seller) {
        return next(new ErrorHandler("Shop does not exist", 404));
      }

      const targetLang = getRequestedLang(req);
      const translatedSeller = applyTranslations(seller, targetLang, "shop");

      res.status(200).json({
        success: true,
        seller: translatedSeller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out from shop
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(200).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get shop info (public)
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      const targetLang = getRequestedLang(req);
      const translatedShop = applyTranslations(shop, targetLang, "shop");

      res.status(200).json({
        success: true,
        shop: translatedShop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop profile picture
router.put(
  "/update-shop-avatar",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let existsSeller = await Shop.findById(req.seller._id);
      if (!existsSeller) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      const imageId = existsSeller.avatar?.public_id;
      if (imageId && imageId !== "default_avatar") {
        await cloudinary.v2.uploader.destroy(imageId);
      }

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
      });

      existsSeller.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };

      await existsSeller.save();

      res.status(200).json({
        success: true,
        seller: existsSeller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller info
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findById(req.seller._id);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      shop.name = name || shop.name;
      shop.description = description !== undefined ? description : shop.description;
      shop.address = address || shop.address;
      shop.phoneNumber = phoneNumber || shop.phoneNumber;
      shop.zipCode = zipCode || shop.zipCode;

      await shop.save();

      // Enqueue background translation for updated seller profile
      enqueueTranslation("shop", shop._id);

      res.status(200).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all sellers --- for admin
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });

      const targetLang = getRequestedLang(req);
      const translatedSellers = applyTranslations(sellers, targetLang, "shop");

      res.status(200).json({
        success: true,
        sellers: translatedSellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller --- admin
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);
      if (!seller) {
        return next(
          new ErrorHandler("Seller is not available with this id", 404)
        );
      }

      if (seller.avatar?.public_id && seller.avatar.public_id !== "default_avatar") {
        await cloudinary.v2.uploader.destroy(seller.avatar.public_id);
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller withdraw methods --- sellers
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(
        req.seller._id,
        { withdrawMethod },
        { new: true }
      );

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller withdraw methods --- only seller
router.delete(
  "/delete-withdraw-method",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);
      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 404));
      }

      seller.withdrawMethod = null;
      await seller.save();

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
