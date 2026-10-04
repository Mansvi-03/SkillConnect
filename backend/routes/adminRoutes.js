const express = require("express");

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  getServices,
  getServiceById,
  deleteService,
} = require("../controllers/serviceController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// ==================== USER MANAGEMENT ====================

// Get all users
router.get("/users", protect, authorize("admin"), getAllUsers);

// Get single user
router.get("/users/:id", protect, authorize("admin"), getUserById);

// Update user
router.put("/users/:id", protect, authorize("admin"), updateUser);

// Delete user
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

// ==================== CATEGORY MANAGEMENT ====================

// Get all categories
router.get("/categories", protect, authorize("admin"), getCategories);

// Get single category
router.get("/categories/:id", protect, authorize("admin"), getCategoryById);

// Create category
router.post("/categories", protect, authorize("admin"), createCategory);

// Update category
router.put("/categories/:id", protect, authorize("admin"), updateCategory);

// Delete category
router.delete("/categories/:id", protect, authorize("admin"), deleteCategory);

// ==================== SERVICE MANAGEMENT ====================

// Get all services
router.get("/services", protect, authorize("admin"), getServices);

// Get single service
router.get("/services/:id", protect, authorize("admin"), getServiceById);

// Delete service
router.delete("/services/:id", protect, authorize("admin"), deleteService);

module.exports = router;
