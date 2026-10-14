const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const { getRequestedLang } = require("../utils/applyTranslations");
const landService = require("../services/landService");

// POST /create-lands - Create new land listing (seller only)
router.post(
  "/create-lands",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const lands = await landService.createLand(req.body, req.seller);
    res.status(201).json({
      success: true,
      lands,
    });
  })
);

// GET /get-all-lands/:id - All lands of a specific seller
router.get(
  "/get-all-lands/:id",
  catchAsyncErrors(async (req, res) => {
    const targetLang = getRequestedLang(req);
    const lands = await landService.getSellerLands(req.params.id, targetLang);
    res.status(200).json({
      success: true,
      lands,
    });
  })
);

// GET /get-land/:id - Single land by ID
router.get(
  "/get-land/:id",
  catchAsyncErrors(async (req, res) => {
    const targetLang = getRequestedLang(req);
    const land = await landService.getLandById(req.params.id, targetLang);
    res.status(200).json({
      success: true,
      land,
    });
  })
);

// DELETE /delete-seller-land/:id - Delete land listing (seller only)
router.delete(
  "/delete-seller-land/:id",
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const result = await landService.deleteSellerLand(req.params.id, req.seller._id);
    res.status(200).json(result);
  })
);

// GET /get-all-lands - Query all lands with search, location, and filters
router.get(
  "/get-all-lands",
  catchAsyncErrors(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 0;
    const search = req.query.search || req.query.keyword || "";
    const location = req.query.location || "";
    const statusland = req.query.statusland || "";
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

    const targetLang = getRequestedLang(req);
    const result = await landService.getAllLands(
      { page, limit, search, location, statusland, minPrice, maxPrice },
      targetLang
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  })
);

// GET /admin-all-lands - All lands for admin
router.get(
  "/admin-all-lands",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res) => {
    const targetLang = getRequestedLang(req);
    const lands = await landService.getAdminAllLands(targetLang);
    res.status(200).json({
      success: true,
      lands,
    });
  })
);

// DELETE /admin-delete-land/:id - Admin delete land
router.delete(
  "/admin-delete-land/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res) => {
    const result = await landService.deleteLandByAdmin(req.params.id);
    res.status(200).json(result);
  })
);

module.exports = router;
