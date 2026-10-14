const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isSeller } = require("../middleware/auth");
const translationService = require("../services/translationService");

// PUT /:model/:id/:lang - Seller manual translation override
router.put(
  "/:model/:id/:lang",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const { model, id, lang } = req.params;
    const updatedFields = req.body.fields || req.body;
    const sellerId = req.seller?._id?.toString();

    const result = await translationService.updateTranslationOverride(
      model,
      id,
      lang,
      updatedFields,
      sellerId
    );

    res.status(200).json({
      success: true,
      message: `Translation for ${lang.toUpperCase()} updated successfully`,
      ...result,
    });
  })
);

module.exports = router;
