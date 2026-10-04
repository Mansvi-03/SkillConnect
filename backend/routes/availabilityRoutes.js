const express = require("express");

const {
  createAvailability,
  getProviderAvailability,
  getServiceAvailability,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
  checkServiceAvailability,
} = require("../controllers/availabilityController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Provider availability
router.get("/provider/:providerId", getProviderAvailability);

// Provider - availability for one of their services
router.get(
  "/service/:serviceId",
  protect,
  authorize("provider"),
  getServiceAvailability,
);

// Customer - check availability
router.get("/check", protect, authorize("customer"), checkServiceAvailability);

// Single availability
router.get("/:id", getAvailabilityById);

// Provider - create availability
router.post("/", protect, authorize("provider"), createAvailability);

// Provider - update availability
router.put("/:id", protect, authorize("provider"), updateAvailability);

// Provider - delete availability
router.delete("/:id", protect, authorize("provider"), deleteAvailability);

module.exports = router;
