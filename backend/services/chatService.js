const Conversation = require("../model/conversation");
const Messages = require("../model/messages");
const ErrorHandler = require("../utils/ErrorHandler");
const cloudinary = require("cloudinary");

class ChatService {
  /**
   * Create or return existing conversation between user and seller
   */
  async createConversation(groupTitle, userId, sellerId) {
    if (!userId || !sellerId) {
      throw new ErrorHandler("User ID and Seller ID are required", 400);
    }

    const existing = await Conversation.findOne({ groupTitle });
    if (existing) {
      return { conversation: existing, isNew: false };
    }

    const conversation = await Conversation.create({
      members: [userId, sellerId],
      groupTitle: groupTitle || `${userId}_${sellerId}`,
    });

    return { conversation, isNew: true };
  }

  /**
   * Get all conversations for a seller
   */
  async getSellerConversations(sellerId, requestingSellerId) {
    if (requestingSellerId.toString() !== sellerId) {
      throw new ErrorHandler("Unauthorized to access these conversations", 403);
    }

    return await Conversation.find({
      members: { $in: [sellerId] },
    }).sort({ updatedAt: -1, createdAt: -1 });
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId, requestingUserId) {
    if (requestingUserId.toString() !== userId) {
      throw new ErrorHandler("Unauthorized to access these conversations", 403);
    }

    return await Conversation.find({
      members: { $in: [userId] },
    }).sort({ updatedAt: -1, createdAt: -1 });
  }

  /**
   * Update the latest message info in conversation
   */
  async updateLastMessage(conversationId, lastMessage, lastMessageId) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage, lastMessageId },
      { new: true }
    );
  }

  /**
   * Create a new chat message
   */
  async createMessage({ conversationId, text, sender, images }) {
    let uploadedImage;

    if (images && images.length > 50) {
      const myCloud = await cloudinary.v2.uploader.upload(images, {
        folder: "messages",
      });
      uploadedImage = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    const message = new Messages({
      conversationId,
      text,
      sender,
      images: uploadedImage || (images && typeof images === "object" ? images : undefined),
    });

    await message.save();
    return message;
  }

  /**
   * Get all messages in a conversation
   */
  async getConversationMessages(conversationId) {
    return await Messages.find({ conversationId });
  }
}

module.exports = new ChatService();
