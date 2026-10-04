const express = require("express");

const { getCustomerDashboard } = require("../controllers/customerController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Customer dashboard
router.get("/dashboard", protect, authorize("customer"), getCustomerDashboard);

module.exports = router;
