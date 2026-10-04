const express = require("express");

const {
  createPayment,
  getMyPayments,
  getPaymentById,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get my payment history
router.get("/", protect, authorize("customer", "provider"), getMyPayments);

// Get single payment
router.get("/:id", protect, authorize("customer", "provider"), getPaymentById);

// Create payment - Customer only
router.post("/", protect, authorize("customer"), createPayment);

module.exports = router;
