const express = require("express");

const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all reviews
router.get("/", getReviews);

// Get single review
router.get("/:id", getReviewById);

// Create review - Customer only
router.post("/", protect, authorize("customer"), createReview);

// Update review - Customer only
router.put("/:id", protect, authorize("customer"), updateReview);

// Delete review - Customer only
router.delete("/:id", protect, authorize("customer"), deleteReview);

module.exports = router;
