const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isSeller, isAuthenticated, isAuthenticatedOrSeller } = require("../middleware/auth");
const chatService = require("../services/chatService");

// POST /create-new-conversation - Start or get existing conversation
router.post(
  "/create-new-conversation",
  isAuthenticatedOrSeller,
  catchAsyncErrors(async (req, res) => {
    const { groupTitle, userId, sellerId } = req.body;
    const { conversation, isNew } = await chatService.createConversation(
      groupTitle,
      userId,
      sellerId
    );

    res.status(isNew ? 201 : 200).json({
      success: true,
      conversation,
    });
  })
);

// GET /get-all-conversation-seller/:id - Seller conversations
router.get(
  "/get-all-conversation-seller/:id",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const conversations = await chatService.getSellerConversations(
      req.params.id,
      req.seller._id
    );
    res.status(200).json({
      success: true,
      conversations,
    });
  })
);

// GET /get-all-conversation-user/:id - User conversations
router.get(
  "/get-all-conversation-user/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const conversations = await chatService.getUserConversations(
      req.params.id,
      req.user._id
    );
    res.status(200).json({
      success: true,
      conversations,
    });
  })
);

// PUT /update-last-message/:id - Update last message
router.put(
  "/update-last-message/:id",
  catchAsyncErrors(async (req, res) => {
    const { lastMessage, lastMessageId } = req.body;
    const conversation = await chatService.updateLastMessage(
      req.params.id,
      lastMessage,
      lastMessageId
    );
    res.status(200).json({
      success: true,
      conversation,
    });
  })
);

module.exports = router;
