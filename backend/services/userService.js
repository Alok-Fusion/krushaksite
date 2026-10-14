const User = require("../model/user");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");

class UserService {
  createActivationToken(user) {
    return jwt.sign(user, process.env.ACTIVATION_SECRET, {
      expiresIn: "15m",
    });
  }

  /**
   * Register new user and send activation email
   */
  async registerUser({ name, email, password, phoneNumber, avatar }) {
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      throw new ErrorHandler("User with this email already exists", 400);
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

    const user = {
      name,
      email,
      password,
      phoneNumber,
      avatar: avatarData,
    };

    const activationToken = this.createActivationToken(user);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const activationUrl = `${frontendUrl}/activation/${activationToken}`;

    await sendMail({
      email: user.email,
      subject: "Activate your Krushak account",
      message: `Hello ${user.name},\n\nPlease click on the following link to activate your Krushak account:\n${activationUrl}\n\nThis link expires in 15 minutes.`,
    });

    return {
      message: `Please check your email (${user.email}) to activate your account!`,
    };
  }

  /**
   * Verify activation token and persist user
   */
  async activateUser(activationToken) {
    let newUser;
    try {
      newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);
    } catch (err) {
      throw new ErrorHandler("Invalid or expired activation token", 400);
    }

    const { name, email, password, phoneNumber, avatar } = newUser;

    let user = await User.findOne({ email });
    if (user) {
      throw new ErrorHandler("User already exists", 400);
    }

    user = await User.create({
      name,
      email,
      avatar,
      phoneNumber,
      password,
    });

    return user;
  }

  /**
   * Login user with phoneNumber & password
   */
  async loginUser(phoneNumber, password) {
    const user = await User.findOne({ phoneNumber }).select("+password");
    if (!user) {
      throw new ErrorHandler("User not found with this phone number", 400);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ErrorHandler("Invalid credentials", 400);
    }

    return user;
  }

  /**
   * Load current user profile
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User doesn't exist", 404);
    }
    return user;
  }

  /**
   * Update user basic information
   */
  async updateUserInfo(userId, { name, email, phoneNumber, password }) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ErrorHandler("Invalid password confirmation", 400);
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    await user.save();
    return user;
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId, avatar) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    if (avatar && avatar !== "") {
      const imageId = user.avatar?.public_id;
      if (imageId && imageId !== "default_avatar") {
        await cloudinary.v2.uploader.destroy(imageId);
      }

      const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars",
        width: 150,
      });

      user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
      await user.save();
    }

    return user;
  }

  /**
   * Add or update address
   */
  async updateAddresses(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    const sameTypeAddress = user.addresses.find(
      (address) => address.addressType === addressData.addressType
    );
    if (sameTypeAddress) {
      throw new ErrorHandler(`${addressData.addressType} address already exists`, 400);
    }

    const existsAddress = user.addresses.find(
      (address) => address._id?.toString() === addressData._id
    );

    if (existsAddress) {
      Object.assign(existsAddress, addressData);
    } else {
      user.addresses.push(addressData);
    }

    await user.save();
    return user;
  }

  /**
   * Delete address
   */
  async deleteAddress(userId, addressId) {
    await User.updateOne(
      { _id: userId },
      { $pull: { addresses: { _id: addressId } } }
    );
    return await User.findById(userId);
  }

  /**
   * Update password
   */
  async updatePassword(userId, oldPassword, newPassword, confirmPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    const isPasswordMatched = await user.comparePassword(oldPassword);
    if (!isPasswordMatched) {
      throw new ErrorHandler("Old password is incorrect!", 400);
    }

    if (newPassword !== confirmPassword) {
      throw new ErrorHandler("Passwords do not match!", 400);
    }

    user.password = newPassword;
    await user.save();
    return { success: true, message: "Password updated successfully!" };
  }

  /**
   * Get public profile by user ID
   */
  async getPublicUserInfo(userId) {
    const user = await User.findById(userId).select("name email avatar createdAt");
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }
    return user;
  }

  /**
   * Admin: Get all users
   */
  async getAllUsers() {
    return await User.find().sort({ createdAt: -1 });
  }

  /**
   * Admin: Delete user
   */
  async deleteUserByAdmin(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found with this id", 404);
    }

    if (user.avatar?.public_id && user.avatar.public_id !== "default_avatar") {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }

    await User.findByIdAndDelete(userId);
    return { success: true, message: "User deleted successfully!" };
  }
}

module.exports = new UserService();
