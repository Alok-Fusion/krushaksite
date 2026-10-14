const Withdraw = require("../model/withdraw");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const sendMail = require("../utils/sendMail");

class WithdrawService {
  /**
   * Create seller withdrawal request
   */
  async createWithdrawRequest(sellerId, amount) {
    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      throw new ErrorHandler("Please enter a valid withdrawal amount", 400);
    }

    const shop = await Shop.findById(sellerId);
    if (!shop) {
      throw new ErrorHandler("Seller account not found", 404);
    }

    if ((shop.availableBalance || 0) < withdrawAmount) {
      throw new ErrorHandler("Insufficient available balance for withdrawal", 400);
    }

    const withdraw = await Withdraw.create({
      seller: shop,
      amount: withdrawAmount,
    });

    shop.availableBalance = shop.availableBalance - withdrawAmount;
    await shop.save();

    try {
      await sendMail({
        email: shop.email,
        subject: "Krushak - Withdrawal Request Received",
        message: `Hello ${shop.name},\n\nYour withdrawal request of ₹${withdrawAmount} is being processed. Typical processing time is 3 to 7 business days.`,
      });
    } catch (mailError) {
      console.error("Failed to send withdrawal email notification:", mailError.message);
    }

    return withdraw;
  }

  /**
   * Admin: Get all withdrawal requests
   */
  async getAllWithdrawRequests() {
    return await Withdraw.find().sort({ createdAt: -1 });
  }

  /**
   * Admin: Approve withdrawal request
   */
  async updateWithdrawStatus(withdrawId, sellerId) {
    const withdraw = await Withdraw.findByIdAndUpdate(
      withdrawId,
      {
        status: "succeed",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!withdraw) {
      throw new ErrorHandler("Withdraw request not found", 404);
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

    return withdraw;
  }
}

module.exports = new WithdrawService();
