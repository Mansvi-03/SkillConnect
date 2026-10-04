const express = require("express");

const {
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// GET MY BOOKINGS
// Customer or Provider
// =====================================================

router.get("/", protect, authorize("customer", "provider"), getMyBookings);

// =====================================================
// CREATE BOOKING
// Customer only
// =====================================================

router.post("/", protect, authorize("customer"), createBooking);

// =====================================================
// BOOKING ACTIONS
// =====================================================

// Accept booking - Provider only
router.put("/:id/accept", protect, authorize("provider"), acceptBooking);

// Reject booking - Provider only
router.put("/:id/reject", protect, authorize("provider"), rejectBooking);

// Cancel booking - Customer only
router.put("/:id/cancel", protect, authorize("customer"), cancelBooking);

// Complete booking - Provider only
router.put("/:id/complete", protect, authorize("provider"), completeBooking);

// =====================================================
// GET SINGLE BOOKING
// IMPORTANT: KEEP THIS LAST
// =====================================================

router.get("/:id", protect, authorize("customer", "provider"), getBookingById);

module.exports = router;
