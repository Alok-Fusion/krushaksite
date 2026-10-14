const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const {
  registerUserSchema,
  loginUserSchema,
  activationSchema,
  updatePasswordSchema,
} = require("../validations/schemas");
const sendToken = require("../utils/jwtToken");
const userService = require("../services/userService");

// POST /create-user - Register user
router.post(
  "/create-user",
  authLimiter,
  validate(registerUserSchema),
  catchAsyncErrors(async (req, res) => {
    const result = await userService.registerUser(req.body);
    res.status(201).json({
      success: true,
      ...result,
    });
  })
);

// POST /activation - Activate user
router.post(
  "/activation",
  authLimiter,
  validate(activationSchema),
  catchAsyncErrors(async (req, res) => {
    const user = await userService.activateUser(req.body.activation_token);
    sendToken(user, 201, res);
  })
);

// POST /login-user - Login user
router.post(
  "/login-user",
  authLimiter,
  validate(loginUserSchema),
  catchAsyncErrors(async (req, res) => {
    const { phoneNumber, password } = req.body;
    const user = await userService.loginUser(phoneNumber, password);
    sendToken(user, 200, res);
  })
);

// GET /getuser - Load current authenticated user
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const user = await userService.getUserById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  })
);

// GET /logout - Logout user
router.get(
  "/logout",
  catchAsyncErrors(async (req, res) => {
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
  })
);

// PUT /update-user-info - Update user basic info
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const user = await userService.updateUserInfo(req.user.id, req.body);
    res.status(200).json({
      success: true,
      user,
    });
  })
);

// PUT /update-avatar - Update user avatar
router.put(
  "/update-avatar",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const user = await userService.updateAvatar(req.user.id, req.body.avatar);
    res.status(200).json({
      success: true,
      user,
    });
  })
);

// PUT /update-user-addresses - Add or update addresses
router.put(
  "/update-user-addresses",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const user = await userService.updateAddresses(req.user.id, req.body);
    res.status(200).json({
      success: true,
      user,
    });
  })
);

// DELETE /delete-user-address/:id - Delete address
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const user = await userService.deleteAddress(req.user._id, req.params.id);
    res.status(200).json({
      success: true,
      user,
    });
  })
);

// PUT /update-user-password - Change user password
router.put(
  "/update-user-password",
  isAuthenticated,
  validate(updatePasswordSchema),
  catchAsyncErrors(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const result = await userService.updatePassword(
      req.user.id,
      oldPassword,
      newPassword,
      confirmPassword
    );
    res.status(200).json(result);
  })
);

// GET /user-info/:id - Public user info
router.get(
  "/user-info/:id",
  catchAsyncErrors(async (req, res) => {
    const user = await userService.getPublicUserInfo(req.params.id);
    res.status(200).json({
      success: true,
      user,
    });
  })
);

// GET /admin-all-users - Admin get all users
router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      users,
    });
  })
);

// DELETE /delete-user/:id - Admin delete user
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res) => {
    const result = await userService.deleteUserByAdmin(req.params.id);
    res.status(200).json(result);
  })
);

module.exports = router;
