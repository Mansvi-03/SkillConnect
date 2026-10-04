const ServiceProvider = require("../models/ServiceProvider");
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

// =====================================================
// GET PROVIDER DASHBOARD
// =====================================================

const getProviderDashboard = async (req, res) => {
  try {
    // Find provider profile of logged-in user
    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    // =================================================
    // SERVICES
    // =================================================

    const totalServices = await Service.countDocuments({
      provider: provider._id,
    });

    // =================================================
    // BOOKINGS
    // =================================================

    const bookings = await Booking.find({
      provider: provider._id,
    });

    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
      (booking) => booking.status === "Pending",
    ).length;

    const acceptedBookings = bookings.filter(
      (booking) => booking.status === "Accepted",
    ).length;

    const completedBookings = bookings.filter(
      (booking) => booking.status === "Completed",
    ).length;

    const rejectedBookings = bookings.filter(
      (booking) => booking.status === "Rejected",
    ).length;

    const cancelledBookings = bookings.filter(
      (booking) => booking.status === "Cancelled",
    ).length;

    // =================================================
    // PAYMENTS
    // =================================================

    const payments = await Payment.find({
      provider: provider._id,
      status: "Success",
    });

    const totalEarnings = payments.reduce((total, payment) => {
      return total + Number(payment.amount || 0);
    }, 0);

    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
      success: true,

      dashboard: {
        totalServices,
        totalBookings,
        pendingBookings,
        acceptedBookings,
        completedBookings,
        rejectedBookings,
        cancelledBookings,
        totalEarnings,
      },
    });
  } catch (error) {
    console.error("GET PROVIDER DASHBOARD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET MY SERVICES
// =====================================================

const getMyServices = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const services = await Service.find({
      provider: provider._id,
    })
      .populate("category")
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("GET MY SERVICES ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProviderDashboard,
  getMyServices,
};
