const express = require("express");
const router = express.Router();
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const Shop = require("../model/shop");
const Lands = require("../model/lands");
const cloudinary = require("cloudinary");
const { getRequestedLang, applyTranslations } = require("../utils/applyTranslations");
const { enqueueTranslation } = require("../utils/translationQueue");

// adding land --- only seller
router.post(
  "/create-lands",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellerId = req.body.sellerId || req.seller._id.toString();
      const shop = await Shop.findById(sellerId);
      if (!shop) {
        return next(new ErrorHandler("Seller does not exist!", 400));
      }

      if (req.seller._id.toString() !== shop._id.toString()) {
        return next(new ErrorHandler("You can only list lands for your own seller account!", 403));
      }

      let images = [];
      if (typeof req.body.images === "string") {
        images.push(req.body.images);
      } else if (Array.isArray(req.body.images)) {
        images = req.body.images;
      }

      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        if (images[i].startsWith("data:") || images[i].startsWith("http")) {
          const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "lands",
          });
          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        } else {
          imagesLinks.push({
            public_id: `land_${Date.now()}_${i}`,
            url: images[i],
          });
        }
      }

      const landData = { ...req.body };
      landData.sellerId = shop._id.toString();
      landData.images = imagesLinks;
      landData.shop = shop;

      const lands = await Lands.create(landData);

      // Enqueue background translation
      enqueueTranslation("lands", lands._id);

      res.status(201).json({
        success: true,
        lands,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all lands of a seller
router.get(
  "/get-all-lands/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const lands = await Lands.find({ sellerId: req.params.id }).sort({
        createdAt: -1,
      });

      const targetLang = getRequestedLang(req);
      const translatedLands = applyTranslations(lands, targetLang, "lands");

      res.status(200).json({
        success: true,
        lands: translatedLands,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);


// get single land by id
router.get(
  "/get-land/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const land = await Lands.findById(req.params.id);
      if (!land) {
        return next(new ErrorHandler("Land listing not found with this id", 404));
      }

      const targetLang = getRequestedLang(req);
      const translatedLand = applyTranslations(land, targetLang, "lands");

      res.status(200).json({
        success: true,
        land: translatedLand,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// delete the land of seller
router.delete(
  "/delete-seller-land/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const landsId = req.params.id;
      const lands = await Lands.findById(landsId);

      if (!lands) {
        return next(new ErrorHandler("Land not found with this id", 404));
      }

      if (lands.sellerId !== req.seller._id.toString()) {
        return next(new ErrorHandler("You are not authorized to delete this land listing", 403));
      }

      if (lands.images && lands.images.length > 0) {
        for (let i = 0; i < lands.images.length; i++) {
          const publicId = lands.images[i]?.public_id;
          if (publicId && !publicId.startsWith("land_")) {
            await cloudinary.v2.uploader.destroy(publicId);
          }
        }
      }

      await Lands.findByIdAndDelete(landsId);

      res.status(200).json({
        success: true,
        message: "Land deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all lands with search, filter, and pagination
router.get(
  "/get-all-lands",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 0; // 0 returns all for compatibility
      const search = req.query.search || req.query.keyword || "";
      const location = req.query.location || "";
      const statusland = req.query.statusland || "";
      const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
      const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { landlocation: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
          { "translations.en.name": { $regex: search, $options: "i" } },
          { "translations.en.description": { $regex: search, $options: "i" } },
          { "translations.en.landlocation": { $regex: search, $options: "i" } },
          { "translations.hi.name": { $regex: search, $options: "i" } },
          { "translations.hi.description": { $regex: search, $options: "i" } },
          { "translations.hi.landlocation": { $regex: search, $options: "i" } },
          { "translations.mr.name": { $regex: search, $options: "i" } },
          { "translations.mr.description": { $regex: search, $options: "i" } },
          { "translations.mr.landlocation": { $regex: search, $options: "i" } },
        ];
      }

      if (location) {
        query.landlocation = { $regex: location, $options: "i" };
      }

      if (statusland && statusland !== "All") {
        query.statusland = statusland;
      }

      if (minPrice !== null || maxPrice !== null) {
        query.price = {};
        if (minPrice !== null) query.price.$gte = minPrice;
        if (maxPrice !== null) query.price.$lte = maxPrice;
      }

      const totalLands = await Lands.countDocuments(query);

      let queryExec = Lands.find(query).sort({ createdAt: -1 });

      if (limit > 0) {
        const skip = (page - 1) * limit;
        queryExec = queryExec.skip(skip).limit(limit);
      }

      const lands = await queryExec;
      const targetLang = getRequestedLang(req);
      const translatedLands = applyTranslations(lands, targetLang, "lands");

      res.status(200).json({
        success: true,
        lands: translatedLands,
        totalLands,
        totalPages: limit > 0 ? Math.ceil(totalLands / limit) : 1,
        currentPage: page,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// admin all lands
router.get(
  "/admin-all-lands",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const lands = await Lands.find().sort({
        createdAt: -1,
      });

      const targetLang = getRequestedLang(req);
      const translatedLands = applyTranslations(lands, targetLang, "lands");

      res.status(200).json({
        success: true,
        lands: translatedLands,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// admin delete land
router.delete(
  "/admin-delete-land/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const landsId = req.params.id;
      const land = await Lands.findById(landsId);

      if (!land) {
        return next(new ErrorHandler("Land listing not found with this id", 404));
      }

      if (land.images && land.images.length > 0) {
        for (let i = 0; i < land.images.length; i++) {
          const publicId = land.images[i]?.public_id;
          if (publicId && !publicId.startsWith("land_")) {
            await cloudinary.v2.uploader.destroy(publicId);
          }
        }
      }

      await Lands.findByIdAndDelete(landsId);

      res.status(200).json({
        success: true,
        message: "Land deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;