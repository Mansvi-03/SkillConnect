const Customer = require("../models/Customer");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Review = require("../models/Review");

// GET CUSTOMER DASHBOARD
const getCustomerDashboard = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      user: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const bookings = await Booking.find({
      customer: customer._id,
    });

    const payments = await Payment.find({
      customer: customer._id,
      status: "Success",
    });

    const reviews = await Review.find({
      customer: customer._id,
    });

    const totalSpent = payments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );

    const pendingBookings = bookings.filter(
      (booking) => booking.status === "Pending",
    ).length;

    const acceptedBookings = bookings.filter(
      (booking) => booking.status === "Accepted",
    ).length;

    const completedBookings = bookings.filter(
      (booking) => booking.status === "Completed",
    ).length;

    const cancelledBookings = bookings.filter(
      (booking) => booking.status === "Cancelled",
    ).length;

    res.status(200).json({
      success: true,

      dashboard: {
        totalBookings: bookings.length,
        pendingBookings,
        acceptedBookings,
        completedBookings,
        cancelledBookings,
        totalPayments: payments.length,
        totalSpent,
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCustomerDashboard,
};
