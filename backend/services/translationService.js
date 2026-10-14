const Product = require("../model/product");
const Lands = require("../model/lands");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");

class TranslationService {
  /**
   * Update seller manual translation override for product, land, or shop
   */
  async updateTranslationOverride(model, id, lang, updatedFields, sellerId) {
    if (!["product", "lands", "shop"].includes(model.toLowerCase())) {
      throw new ErrorHandler("Invalid model type. Must be product, lands, or shop.", 400);
    }

    if (!["en", "hi", "mr"].includes(lang.toLowerCase())) {
      throw new ErrorHandler("Invalid language. Must be en, hi, or mr.", 400);
    }

    if (!updatedFields || typeof updatedFields !== "object") {
      throw new ErrorHandler("Please provide updated translation fields", 400);
    }

    const targetLang = lang.toLowerCase();
    let doc;

    if (model.toLowerCase() === "product") {
      doc = await Product.findById(id);
      if (!doc) throw new ErrorHandler("Product not found", 404);
      if (doc.shopId !== sellerId) {
        throw new ErrorHandler("You are not authorized to edit translations for this product", 403);
      }
    } else if (model.toLowerCase() === "lands") {
      doc = await Lands.findById(id);
      if (!doc) throw new ErrorHandler("Land listing not found", 404);
      if (doc.sellerId !== sellerId) {
        throw new ErrorHandler("You are not authorized to edit translations for this land listing", 403);
      }
    } else if (model.toLowerCase() === "shop") {
      doc = await Shop.findById(id);
      if (!doc) throw new ErrorHandler("Shop not found", 404);
      if (doc._id.toString() !== sellerId) {
        throw new ErrorHandler("You are not authorized to edit translations for this shop", 403);
      }
    }

    if (!doc.translations) {
      doc.translations = { en: {}, hi: {}, mr: {} };
    }
    if (!doc.edited) {
      doc.edited = { en: false, hi: false, mr: false };
    }

    doc.translations[targetLang] = {
      ...(doc.translations[targetLang] || {}),
      ...updatedFields,
    };
    doc.edited[targetLang] = true;

    doc.markModified("translations");
    doc.markModified("edited");
    await doc.save({ validateBeforeSave: false });

    return {
      translations: doc.translations,
      edited: doc.edited,
    };
  }
}

module.exports = new TranslationService();
