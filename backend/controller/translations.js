const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAuthenticated } = require("../middleware/auth");
const Product = require("../model/product");
const Lands = require("../model/lands");
const Shop = require("../model/shop");

// PUT /api/translations/:model/:id/:lang or /api/v2/translations/:model/:id/:lang
router.put(
  "/:model/:id/:lang",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const { model, id, lang } = req.params;

    if (!["product", "lands", "shop"].includes(model.toLowerCase())) {
      return next(new ErrorHandler("Invalid model type. Must be product, lands, or shop.", 400));
    }

    if (!["en", "hi", "mr"].includes(lang.toLowerCase())) {
      return next(new ErrorHandler("Invalid language. Must be en, hi, or mr.", 400));
    }

    const targetLang = lang.toLowerCase();
    const updatedFields = req.body.fields || req.body;
    if (!updatedFields || typeof updatedFields !== "object") {
      return next(new ErrorHandler("Please provide updated translation fields", 400));
    }

    const sellerId = req.seller?._id?.toString();

    let doc;
    if (model.toLowerCase() === "product") {
      doc = await Product.findById(id);
      if (!doc) return next(new ErrorHandler("Product not found", 404));

      // Ownership check: seller must own this shop product
      if (doc.shopId !== sellerId) {
        return next(new ErrorHandler("You are not authorized to edit translations for this product", 403));
      }
    } else if (model.toLowerCase() === "lands") {
      doc = await Lands.findById(id);
      if (!doc) return next(new ErrorHandler("Land listing not found", 404));

      // Ownership check: seller must own this land listing
      if (doc.sellerId !== sellerId) {
        return next(new ErrorHandler("You are not authorized to edit translations for this land listing", 403));
      }
    } else if (model.toLowerCase() === "shop") {
      doc = await Shop.findById(id);
      if (!doc) return next(new ErrorHandler("Shop not found", 404));

      // Ownership check: seller must be the shop owner
      if (doc._id.toString() !== sellerId) {
        return next(new ErrorHandler("You are not authorized to edit translations for this shop", 403));
      }
    }

    if (!doc.translations) {
      doc.translations = { en: {}, hi: {}, mr: {} };
    }
    if (!doc.edited) {
      doc.edited = { en: false, hi: false, mr: false };
    }

    // Merge updated fields
    doc.translations[targetLang] = {
      ...(doc.translations[targetLang] || {}),
      ...updatedFields,
    };
    doc.edited[targetLang] = true;

    doc.markModified("translations");
    doc.markModified("edited");
    await doc.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Translation for ${targetLang.toUpperCase()} updated successfully`,
      translations: doc.translations,
      edited: doc.edited,
    });
  })
);

module.exports = router;
