const Shop = require("../model/shop");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const { applyTranslations } = require("../utils/applyTranslations");
const { enqueueTranslation } = require("../utils/translationQueue");

class ShopService {
  createActivationToken(seller) {
    return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
      expiresIn: "15m",
    });
  }

  /**
   * Register shop & send activation email
   */
  async registerShop({ name, email, password, avatar, address, phoneNumber, zipCode }) {
    const sellerEmail = await Shop.findOne({ email });
    if (sellerEmail) {
      throw new ErrorHandler("Shop with this email already exists", 400);
    }

    let avatarData = {
      public_id: "default_avatar",
      url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    };

    if (avatar && avatar.length > 50) {
      const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars",
      });
      avatarData = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    const seller = {
      name,
      email,
      password,
      avatar: avatarData,
      address,
      phoneNumber,
      zipCode,
    };

    const activationToken = this.createActivationToken(seller);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const activationUrl = `${frontendUrl}/seller/activation/${activationToken}`;

    await sendMail({
      email: seller.email,
      subject: "Activate your Krushak Seller Account",
      message: `Hello ${seller.name},\n\nPlease click on the following link to activate your seller account:\n${activationUrl}\n\nThis link expires in 15 minutes.`,
    });

    return {
      message: `Please check your email (${seller.email}) to activate your shop!`,
    };
  }

  /**
   * Activate shop
   */
  async activateShop(activationToken) {
    let newSeller;
    try {
      newSeller = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);
    } catch (err) {
      throw new ErrorHandler("Invalid or expired activation token", 400);
    }

    const { name, email, password, avatar, zipCode, address, phoneNumber } = newSeller;

    let seller = await Shop.findOne({ email });
    if (seller) {
      throw new ErrorHandler("Shop already exists", 400);
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

    return seller;
  }

  /**
   * Login shop
   */
  async loginShop(email, password) {
    const user = await Shop.findOne({ email }).select("+password");
    if (!user) {
      throw new ErrorHandler("Shop doesn't exist with this email", 400);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ErrorHandler("Invalid credentials", 400);
    }

    return user;
  }

  /**
   * Load current seller profile
   */
  async getShopById(shopId, targetLang = "en") {
    const seller = await Shop.findById(shopId);
    if (!seller) {
      throw new ErrorHandler("Shop does not exist", 404);
    }
    return applyTranslations(seller, targetLang, "shop");
  }

  /**
   * Get public shop info
   */
  async getPublicShopInfo(shopId, targetLang = "en") {
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new ErrorHandler("Shop not found", 404);
    }
    return applyTranslations(shop, targetLang, "shop");
  }

  /**
   * Update shop avatar
   */
  async updateAvatar(shopId, avatar) {
    const existsSeller = await Shop.findById(shopId);
    if (!existsSeller) {
      throw new ErrorHandler("Shop not found", 404);
    }

    const imageId = existsSeller.avatar?.public_id;
    if (imageId && imageId !== "default_avatar") {
      await cloudinary.v2.uploader.destroy(imageId);
    }

    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "avatars",
      width: 150,
    });

    existsSeller.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };

    await existsSeller.save();
    return existsSeller;
  }

  /**
   * Update seller profile info
   */
  async updateShopInfo(shopId, { name, description, address, phoneNumber, zipCode }) {
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new ErrorHandler("Shop not found", 404);
    }

    shop.name = name || shop.name;
    shop.description = description !== undefined ? description : shop.description;
    shop.address = address || shop.address;
    shop.phoneNumber = phoneNumber || shop.phoneNumber;
    shop.zipCode = zipCode || shop.zipCode;

    await shop.save();

    // Enqueue background translation for updated seller profile
    enqueueTranslation("shop", shop._id);

    return shop;
  }

  /**
   * Update withdraw method
   */
  async updatePaymentMethods(shopId, withdrawMethod) {
    return await Shop.findByIdAndUpdate(
      shopId,
      { withdrawMethod },
      { new: true }
    );
  }

  /**
   * Delete withdraw method
   */
  async deletePaymentMethod(shopId) {
    const seller = await Shop.findById(shopId);
    if (!seller) {
      throw new ErrorHandler("Seller not found with this id", 404);
    }
    seller.withdrawMethod = null;
    await seller.save();
    return seller;
  }

  /**
   * Admin: Get all sellers
   */
  async getAllSellers(targetLang = "en") {
    const sellers = await Shop.find().sort({ createdAt: -1 });
    return applyTranslations(sellers, targetLang, "shop");
  }

  /**
   * Admin: Delete seller
   */
  async deleteSellerByAdmin(sellerId) {
    const seller = await Shop.findById(sellerId);
    if (!seller) {
      throw new ErrorHandler("Seller is not available with this id", 404);
    }

    if (seller.avatar?.public_id && seller.avatar.public_id !== "default_avatar") {
      await cloudinary.v2.uploader.destroy(seller.avatar.public_id);
    }

    await Shop.findByIdAndDelete(sellerId);
    return { success: true, message: "Seller deleted successfully!" };
  }
}

module.exports = new ShopService();
