const express = require("express");

const {
  createPayment,
  getMyPayments,
  getPaymentById,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// GET MY PAYMENTS
// =====================================================
// Customer:
//     Shows payments made by the customer.
//
// Provider:
//     Shows successful payments received
//     for the provider's services.

router.get("/", protect, authorize("customer", "provider"), getMyPayments);

// =====================================================
// GET SINGLE PAYMENT
// =====================================================

router.get("/:id", protect, authorize("customer", "provider"), getPaymentById);

// =====================================================
// CREATE PAYMENT
// =====================================================
// Customer only.

router.post("/", protect, authorize("customer"), createPayment);

module.exports = router;
