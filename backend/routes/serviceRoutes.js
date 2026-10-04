const express = require("express");

const {
  createService,
  getServices,
  getServiceById,
  getServicesByCategory,
  getMyServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Get all services
router.get("/", getServices);

// Get services by category
router.get("/category/:categoryId", getServicesByCategory);

// Get provider's own services
// IMPORTANT: This must come before "/:id"
router.get("/my-services", protect, authorize("provider"), getMyServices);

// Get single service
router.get("/:id", getServiceById);

// Create service with multiple images
router.post(
  "/",
  protect,
  authorize("provider"),
  upload.array("images", 5),
  createService,
);

// Update service with additional images
router.put(
  "/:id",
  protect,
  authorize("provider"),
  upload.array("images", 5),
  updateService,
);

// Delete service
router.delete("/:id", protect, authorize("provider", "admin"), deleteService);

module.exports = router;
