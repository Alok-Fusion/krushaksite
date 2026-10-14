const Product = require("../model/product");
const Order = require("../model/order");
const Shop = require("../model/shop");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const { applyTranslations } = require("../utils/applyTranslations");
const { enqueueTranslation } = require("../utils/translationQueue");

class ProductService {
  /**
   * Create a new product listing with image upload and async translation queue
   */
  async createProduct(productInput, seller) {
    const shopId = productInput.shopId || seller._id.toString();
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new ErrorHandler("Shop Id is invalid!", 400);
    }

    if (seller._id.toString() !== shop._id.toString()) {
      throw new ErrorHandler("You can only create products for your own shop!", 403);
    }

    let images = [];
    if (typeof productInput.images === "string") {
      images.push(productInput.images);
    } else if (Array.isArray(productInput.images)) {
      images = productInput.images;
    }

    const imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
      if (images[i].startsWith("data:") || images[i].startsWith("http")) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      } else {
        imagesLinks.push({
          public_id: `product_${Date.now()}_${i}`,
          url: images[i],
        });
      }
    }

    const productData = { ...productInput };
    productData.shopId = shop._id.toString();
    productData.images = imagesLinks;
    productData.shop = shop;

    const product = await Product.create(productData);

    // Enqueue background translation for en, hi, mr
    enqueueTranslation("product", product._id);

    return product;
  }

  /**
   * Get all products of a specific shop
   */
  async getShopProducts(shopId, targetLang = "en") {
    const products = await Product.find({ shopId }).sort({ createdAt: -1 });
    return applyTranslations(products, targetLang, "product");
  }

  /**
   * Get a single product by ID
   */
  async getProductById(productId, targetLang = "en") {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorHandler("Product not found with this id", 404);
    }
    return applyTranslations(product, targetLang, "product");
  }

  /**
   * Delete a product owned by seller
   */
  async deleteProduct(productId, sellerId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorHandler("Product not found with this id", 404);
    }

    if (product.shopId !== sellerId.toString()) {
      throw new ErrorHandler("You are not authorized to delete this product", 403);
    }

    if (product.images && product.images.length > 0) {
      for (let i = 0; i < product.images.length; i++) {
        const publicId = product.images[i]?.public_id;
        if (publicId && !publicId.startsWith("product_")) {
          await cloudinary.v2.uploader.destroy(publicId);
        }
      }
    }

    await Product.findByIdAndDelete(productId);
    return { success: true, message: "Product deleted successfully!" };
  }

  /**
   * Query all products with pagination, category, price range, and search
   */
  async getAllProducts({ page = 1, limit = 0, search = "", category = "", minPrice = null, maxPrice = null }, targetLang = "en") {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { "translations.en.name": { $regex: search, $options: "i" } },
        { "translations.en.description": { $regex: search, $options: "i" } },
        { "translations.hi.name": { $regex: search, $options: "i" } },
        { "translations.hi.description": { $regex: search, $options: "i" } },
        { "translations.mr.name": { $regex: search, $options: "i" } },
        { "translations.mr.description": { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (minPrice !== null || maxPrice !== null) {
      query.discountPrice = {};
      if (minPrice !== null) query.discountPrice.$gte = minPrice;
      if (maxPrice !== null) query.discountPrice.$lte = maxPrice;
    }

    const totalProducts = await Product.countDocuments(query);

    let queryExec = Product.find(query).sort({ createdAt: -1 });

    if (limit > 0) {
      const skip = (page - 1) * limit;
      queryExec = queryExec.skip(skip).limit(limit);
    }

    const products = await queryExec;
    const translatedProducts = applyTranslations(products, targetLang, "product");

    return {
      products: translatedProducts,
      totalProducts,
      totalPages: limit > 0 ? Math.ceil(totalProducts / limit) : 1,
      currentPage: page,
    };
  }

  /**
   * Add or update product review
   */
  async addReview({ user, rating, comment, productId, orderId }) {
    if (!productId || !rating) {
      throw new ErrorHandler("Product ID and rating are required", 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    const review = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      rating: Number(rating),
      comment,
      productId,
      createdAt: new Date(),
    };

    const existingIndex = product.reviews.findIndex(
      (rev) => rev.user?._id?.toString() === user._id.toString()
    );

    if (existingIndex !== -1) {
      product.reviews[existingIndex].rating = rating;
      product.reviews[existingIndex].comment = comment;
    } else {
      product.reviews.push(review);
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = product.reviews.length > 0 ? avg / product.reviews.length : 0;
    await product.save({ validateBeforeSave: false });

    // Enqueue background translation for new/updated review
    enqueueTranslation("product", product._id);

    if (orderId) {
      await Order.findByIdAndUpdate(
        orderId,
        { $set: { "cart.$[elem].isReviewed": true } },
        { arrayFilters: [{ "elem._id": productId }], new: true }
      );
    }

    return { success: true, message: "Reviewed successfully!" };
  }

  /**
   * Admin: Get all products
   */
  async getAdminAllProducts(targetLang = "en") {
    const products = await Product.find().sort({ createdAt: -1 });
    return applyTranslations(products, targetLang, "product");
  }
}

module.exports = new ProductService();
