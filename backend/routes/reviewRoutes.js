const express = require("express");

const {
  createReview,
  getReviews,
  getReviewsByService,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// GET ALL REVIEWS
// =====================================================

router.get("/", getReviews);

// =====================================================
// GET REVIEWS FOR A SERVICE
// IMPORTANT: This must come before /:id
// =====================================================

router.get("/service/:serviceId", getReviewsByService);

// =====================================================
// GET SINGLE REVIEW
// =====================================================

router.get("/:id", getReviewById);

// =====================================================
// CREATE REVIEW
// =====================================================

router.post("/", protect, authorize("customer"), createReview);

// =====================================================
// UPDATE REVIEW
// =====================================================

router.put("/:id", protect, authorize("customer"), updateReview);

// =====================================================
// DELETE REVIEW
// =====================================================

router.delete("/:id", protect, authorize("customer"), deleteReview);

module.exports = router;
