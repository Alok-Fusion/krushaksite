const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticatedOrSeller } = require("../middleware/auth");
const chatService = require("../services/chatService");

// POST /create-new-message - Send message
router.post(
  "/create-new-message",
  isAuthenticatedOrSeller,
  catchAsyncErrors(async (req, res) => {
    const sender = req.user
      ? req.user._id.toString()
      : req.seller
      ? req.seller._id.toString()
      : req.body.sender;

    const message = await chatService.createMessage({
      conversationId: req.body.conversationId,
      text: req.body.text,
      sender,
      images: req.body.images,
    });

    res.status(201).json({
      success: true,
      message,
    });
  })
);

// GET /get-all-messages/:id - Get conversation messages
router.get(
  "/get-all-messages/:id",
  isAuthenticatedOrSeller,
  catchAsyncErrors(async (req, res) => {
    const messages = await chatService.getConversationMessages(req.params.id);
    res.status(200).json({
      success: true,
      messages,
    });
  })
);

module.exports = router;
