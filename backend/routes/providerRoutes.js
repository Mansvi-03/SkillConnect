const express = require("express");

const {
  getProviderDashboard,
  getMyServices,
} = require("../controllers/providerController");

const { protect } = require("../middleware/authMiddleware");

const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// PROVIDER DASHBOARD
// =====================================================

router.get("/dashboard", protect, authorize("provider"), getProviderDashboard);

// =====================================================
// PROVIDER'S OWN SERVICES
// =====================================================

router.get("/services", protect, authorize("provider"), getMyServices);

module.exports = router;
