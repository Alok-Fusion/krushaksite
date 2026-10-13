const Conversation = require("../model/conversation");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const express = require("express");
const { isSeller, isAuthenticated, isAuthenticatedOrSeller } = require("../middleware/auth");
const router = express.Router();

// create a new conversation
router.post(
  "/create-new-conversation",
  isAuthenticatedOrSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { groupTitle, userId, sellerId } = req.body;

      if (!userId || !sellerId) {
        return next(new ErrorHandler("User ID and Seller ID are required", 400));
      }

      const isConversationExist = await Conversation.findOne({ groupTitle });

      if (isConversationExist) {
        return res.status(200).json({
          success: true,
          conversation: isConversationExist,
        });
      }

      const conversation = await Conversation.create({
        members: [userId, sellerId],
        groupTitle: groupTitle || `${userId}_${sellerId}`,
      });

      res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get seller conversations
router.get(
  "/get-all-conversation-seller/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      if (req.seller._id.toString() !== req.params.id) {
        return next(
          new ErrorHandler("Unauthorized to access these conversations", 403)
        );
      }

      const conversations = await Conversation.find({
        members: {
          $in: [req.params.id],
        },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(200).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get user conversations
router.get(
  "/get-all-conversation-user/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      if (req.user._id.toString() !== req.params.id) {
        return next(
          new ErrorHandler("Unauthorized to access these conversations", 403)
        );
      }

      const conversations = await Conversation.find({
        members: {
          $in: [req.params.id],
        },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(200).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update the last message
router.put(
  "/update-last-message/:id",
  isAuthenticatedOrSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { lastMessage, lastMessageId } = req.body;

      const conversation = await Conversation.findByIdAndUpdate(
        req.params.id,
        {
          lastMessage,
          lastMessageId,
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        conversation,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
