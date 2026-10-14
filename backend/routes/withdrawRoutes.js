const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const withdrawService = require("../services/withdrawService");

// POST /create-withdraw-request - Seller create withdrawal
router.post(
  "/create-withdraw-request",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const withdraw = await withdrawService.createWithdrawRequest(
      req.seller._id,
      req.body.amount
    );
    res.status(201).json({
      success: true,
      withdraw,
    });
  })
);

// GET /get-all-withdraw-request - Admin get all requests
router.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res) => {
    const withdraws = await withdrawService.getAllWithdrawRequests();
    res.status(200).json({
      success: true,
      withdraws,
    });
  })
);

// PUT /update-withdraw-request/:id - Admin update withdrawal status
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res) => {
    const withdraw = await withdrawService.updateWithdrawStatus(
      req.params.id,
      req.body.sellerId
    );
    res.status(200).json({
      success: true,
      withdraw,
    });
  })
);

module.exports = router;
