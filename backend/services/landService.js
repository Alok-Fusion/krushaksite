const Lands = require("../model/lands");
const Shop = require("../model/shop");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const { applyTranslations } = require("../utils/applyTranslations");
const { enqueueTranslation } = require("../utils/translationQueue");

class LandService {
  /**
   * Create new agricultural land listing
   */
  async createLand(landInput, seller) {
    const sellerId = landInput.sellerId || seller._id.toString();
    const shop = await Shop.findById(sellerId);
    if (!shop) {
      throw new ErrorHandler("Seller does not exist!", 400);
    }

    if (seller._id.toString() !== shop._id.toString()) {
      throw new ErrorHandler("You can only list lands for your own seller account!", 403);
    }

    let images = [];
    if (typeof landInput.images === "string") {
      images.push(landInput.images);
    } else if (Array.isArray(landInput.images)) {
      images = landInput.images;
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

    const landData = { ...landInput };
    landData.sellerId = shop._id.toString();
    landData.images = imagesLinks;
    landData.shop = shop;

    const lands = await Lands.create(landData);

    // Enqueue background translation
    enqueueTranslation("lands", lands._id);

    return lands;
  }

  /**
   * Get all lands for a specific seller
   */
  async getSellerLands(sellerId, targetLang = "en") {
    const lands = await Lands.find({ sellerId }).sort({ createdAt: -1 });
    return applyTranslations(lands, targetLang, "lands");
  }

  /**
   * Get single land by ID
   */
  async getLandById(landId, targetLang = "en") {
    const land = await Lands.findById(landId);
    if (!land) {
      throw new ErrorHandler("Land listing not found with this id", 404);
    }
    return applyTranslations(land, targetLang, "lands");
  }

  /**
   * Delete land owned by seller
   */
  async deleteSellerLand(landId, sellerId) {
    const land = await Lands.findById(landId);
    if (!land) {
      throw new ErrorHandler("Land not found with this id", 404);
    }

    if (land.sellerId !== sellerId.toString()) {
      throw new ErrorHandler("You are not authorized to delete this land listing", 403);
    }

    if (land.images && land.images.length > 0) {
      for (let i = 0; i < land.images.length; i++) {
        const publicId = land.images[i]?.public_id;
        if (publicId && !publicId.startsWith("land_")) {
          await cloudinary.v2.uploader.destroy(publicId);
        }
      }
    }

    await Lands.findByIdAndDelete(landId);
    return { success: true, message: "Land deleted successfully" };
  }

  /**
   * Query lands with location, price range, status, and search
   */
  async getAllLands({ page = 1, limit = 0, search = "", location = "", statusland = "", minPrice = null, maxPrice = null }, targetLang = "en") {
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
    const translatedLands = applyTranslations(lands, targetLang, "lands");

    return {
      lands: translatedLands,
      totalLands,
      totalPages: limit > 0 ? Math.ceil(totalLands / limit) : 1,
      currentPage: page,
    };
  }

  /**
   * Admin: Get all lands
   */
  async getAdminAllLands(targetLang = "en") {
    const lands = await Lands.find().sort({ createdAt: -1 });
    return applyTranslations(lands, targetLang, "lands");
  }

  /**
   * Admin: Delete land
   */
  async deleteLandByAdmin(landId) {
    const land = await Lands.findById(landId);
    if (!land) {
      throw new ErrorHandler("Land listing not found with this id", 404);
    }

    if (land.images && land.images.length > 0) {
      for (let i = 0; i < land.images.length; i++) {
        const publicId = land.images[i]?.public_id;
        if (publicId && !publicId.startsWith("land_")) {
          await cloudinary.v2.uploader.destroy(publicId);
        }
      }
    }

    await Lands.findByIdAndDelete(landId);
    return { success: true, message: "Land deleted successfully" };
  }
}

module.exports = new LandService();
