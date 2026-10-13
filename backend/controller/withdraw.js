const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const Withdraw = require("../model/withdraw");
const sendMail = require("../utils/sendMail");
const router = express.Router();

// create withdraw request --- only for seller
router.post(
  "/create-withdraw-request",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { amount } = req.body;
      const withdrawAmount = Number(amount);

      if (!withdrawAmount || withdrawAmount <= 0) {
        return next(new ErrorHandler("Please enter a valid withdrawal amount", 400));
      }

      const shop = await Shop.findById(req.seller._id);
      if (!shop) {
        return next(new ErrorHandler("Seller account not found", 404));
      }

      if ((shop.availableBalance || 0) < withdrawAmount) {
        return next(new ErrorHandler("Insufficient available balance for withdrawal", 400));
      }

      const data = {
        seller: req.seller,
        amount: withdrawAmount,
      };

      const withdraw = await Withdraw.create(data);

      shop.availableBalance = shop.availableBalance - withdrawAmount;
      await shop.save();

      try {
        await sendMail({
          email: req.seller.email,
          subject: "Krushak - Withdrawal Request Received",
          message: `Hello ${req.seller.name},\n\nYour withdrawal request of ₹${withdrawAmount} is being processed. Typical processing time is 3 to 7 business days.`,
        });
      } catch (mailError) {
        console.error("Failed to send withdrawal email notification:", mailError.message);
      }

      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all withdraws --- admin
router.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const withdraws = await Withdraw.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        withdraws,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update withdraw request ---- admin
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { sellerId } = req.body;

      const withdraw = await Withdraw.findByIdAndUpdate(
        req.params.id,
        {
          status: "succeed",
          updatedAt: Date.now(),
        },
        { new: true }
      );

      if (!withdraw) {
        return next(new ErrorHandler("Withdraw request not found", 404));
      }

      const seller = await Shop.findById(sellerId || withdraw.seller?._id);
      if (seller) {
        const transaction = {
          _id: withdraw._id,
          amount: withdraw.amount,
          updatedAt: withdraw.updatedAt,
          status: withdraw.status,
        };

        seller.transections = [...(seller.transections || []), transaction];
        await seller.save();

        try {
          await sendMail({
            email: seller.email,
            subject: "Krushak - Withdrawal Payout Confirmation",
            message: `Hello ${seller.name},\n\nYour withdrawal of ₹${withdraw.amount} has been successfully disbursed to your payout method.`,
          });
        } catch (mailErr) {
          console.error("Disbursement mail error:", mailErr.message);
        }
      }

      res.status(200).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
