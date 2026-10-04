const express = require("express");

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all categories
router.get("/", getCategories);

// Get single category
router.get("/:id", getCategoryById);

// Create category - Admin only
router.post("/", protect, authorize("admin"), createCategory);

// Update category - Admin only
router.put("/:id", protect, authorize("admin"), updateCategory);

// Delete category - Admin only
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
