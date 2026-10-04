const express = require("express");

const {
  getAdminDashboard,
} = require("../controllers/adminDashboardController");

const { protect } = require("../middleware/authMiddleware");

const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get("/", protect, authorize("admin"), getAdminDashboard);

module.exports = router;
