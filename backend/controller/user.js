const express = require("express");
const User = require("../model/user");
const router = express.Router();
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const {
  registerUserSchema,
  loginUserSchema,
  activationSchema,
  updatePasswordSchema,
} = require("../validations/schemas");

// Helper to create activation token
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "15m",
  });
};

// create user
router.post(
  "/create-user",
  authLimiter,
  validate(registerUserSchema),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, email, password, phoneNumber, avatar } = req.body;
      const userEmail = await User.findOne({ email });

      if (userEmail) {
        return next(new ErrorHandler("User with this email already exists", 400));
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

      const activationToken = createActivationToken(user);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const activationUrl = `${frontendUrl}/activation/${activationToken}`;

      try {
        await sendMail({
          email: user.email,
          subject: "Activate your Krushak account",
          message: `Hello ${user.name},\n\nPlease click on the following link to activate your Krushak account:\n${activationUrl}\n\nThis link expires in 15 minutes.`,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email (${user.email}) to activate your account!`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to send activation email", 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// activate user
router.post(
  "/activation",
  authLimiter,
  validate(activationSchema),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newUser) {
        return next(new ErrorHandler("Invalid or expired activation token", 400));
      }

      const { name, email, password, phoneNumber, avatar } = newUser;

      let user = await User.findOne({ email });
      if (user) {
        return next(new ErrorHandler("User already exists", 400));
      }

      user = await User.create({
        name,
        email,
        avatar,
        phoneNumber,
        password,
      });

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message || "Activation failed", 500));
    }
  })
);

// login user
router.post(
  "/login-user",
  authLimiter,
  validate(loginUserSchema),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { password, phoneNumber } = req.body;

      const user = await User.findOne({ phoneNumber }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User not found with this phone number", 400));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Invalid credentials", 400));
      }

      sendToken(user, 200, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load user
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return next(new ErrorHandler("User doesn't exist", 404));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out user
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("token", null, {
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

// update user info
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password, phoneNumber, name } = req.body;

      const user = await User.findById(req.user.id).select("+password");
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Invalid password confirmation", 400));
      }

      user.name = name || user.name;
      user.email = email || user.email;
      user.phoneNumber = phoneNumber || user.phoneNumber;

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user avatar
router.put(
  "/update-avatar",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let existsUser = await User.findById(req.user.id);
      if (req.body.avatar && req.body.avatar !== "") {
        const imageId = existsUser.avatar?.public_id;
        if (imageId && imageId !== "default_avatar") {
          await cloudinary.v2.uploader.destroy(imageId);
        }

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
        });

        existsUser.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await existsUser.save();

      res.status(200).json({
        success: true,
        user: existsUser,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user addresses
router.put(
  "/update-user-addresses",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      const sameTypeAddress = user.addresses.find(
        (address) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(
          new ErrorHandler(`${req.body.addressType} address already exists`, 400)
        );
      }

      const existsAddress = user.addresses.find(
        (address) => address._id?.toString() === req.body._id
      );

      if (existsAddress) {
        Object.assign(existsAddress, req.body);
      } else {
        user.addresses.push(req.body);
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete user address
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      await User.updateOne(
        { _id: userId },
        { $pull: { addresses: { _id: addressId } } }
      );

      const user = await User.findById(userId);

      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user password
router.put(
  "/update-user-password",
  isAuthenticated,
  validate(updatePasswordSchema),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("+password");

      const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect!", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(
          new ErrorHandler("Passwords do not match!", 400)
        );
      }

      user.password = req.body.newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// find public user info by userId
router.get(
  "/user-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).select("name email avatar createdAt");
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all users --- for admin
router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete user --- admin
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(new ErrorHandler("User not found with this id", 404));
      }

      if (user.avatar?.public_id && user.avatar.public_id !== "default_avatar") {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      }

      await User.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
