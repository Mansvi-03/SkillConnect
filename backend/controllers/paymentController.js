const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const ServiceProvider = require("../models/ServiceProvider");

const generateNotification = require("../utils/generateNotification");

// =====================================================
// CREATE PAYMENT
// =====================================================

const createPayment = async (req, res) => {
  try {
    const { booking, paymentMethod } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!booking || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Booking and payment method are required",
      });
    }

    // -------------------------------------------------
    // VALID PAYMENT METHOD
    // -------------------------------------------------

    const allowedMethods = ["Demo Card", "Demo UPI", "Demo Cash"];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // -------------------------------------------------
    // FIND CUSTOMER PROFILE
    // -------------------------------------------------

    const customer = await Customer.findOne({
      user: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    // -------------------------------------------------
    // FIND BOOKING
    // -------------------------------------------------

    const bookingData = await Booking.findById(booking)
      .populate("service")
      .populate("customer")
      .populate("provider");

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // -------------------------------------------------
    // CHECK BOOKING OWNERSHIP
    // -------------------------------------------------

    if (bookingData.customer._id.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own bookings",
      });
    }

    // -------------------------------------------------
    // PAYMENT ALLOWED FOR ACCEPTED OR COMPLETED
    // -------------------------------------------------

    if (
      bookingData.status !== "Accepted" &&
      bookingData.status !== "Completed"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is allowed only for accepted or completed bookings",
      });
    }

    // -------------------------------------------------
    // CHECK ALREADY PAID
    // -------------------------------------------------

    if (bookingData.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been paid",
      });
    }

    // -------------------------------------------------
    // CHECK EXISTING PAYMENT
    // -------------------------------------------------

    const existingPayment = await Payment.findOne({
      booking: bookingData._id,
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this booking",
      });
    }

    // -------------------------------------------------
    // GENERATE TRANSACTION ID
    // -------------------------------------------------

    const transactionId =
      "TXN-" + Date.now() + "-" + Math.floor(Math.random() * 10000);

    // -------------------------------------------------
    // CREATE PAYMENT
    // -------------------------------------------------

    const payment = await Payment.create({
      booking: bookingData._id,

      customer: bookingData.customer._id,

      provider: bookingData.provider._id,

      amount: bookingData.amount,

      paymentMethod,

      transactionId,

      status: "Success",

      paidAt: new Date(),
    });

    // -------------------------------------------------
    // UPDATE BOOKING PAYMENT STATUS
    // -------------------------------------------------

    bookingData.paymentStatus = "Paid";

    await bookingData.save();

    // -------------------------------------------------
    // CUSTOMER NOTIFICATION
    // -------------------------------------------------

    try {
      await generateNotification({
        recipient: bookingData.customer.user,

        type: "Payment",

        title: "Payment Successful",

        message: `Your payment of ₹${bookingData.amount} was successful.`,

        relatedBooking: bookingData._id,
      });
    } catch (notificationError) {
      console.error("CUSTOMER NOTIFICATION ERROR:", notificationError.message);
    }

    // -------------------------------------------------
    // PROVIDER NOTIFICATION
    // -------------------------------------------------

    try {
      await generateNotification({
        recipient: bookingData.provider.user,

        type: "Payment",

        title: "Payment Received",

        message: `You received ₹${bookingData.amount} for ${bookingData.service?.name || "your service"}.`,

        relatedBooking: bookingData._id,
      });
    } catch (notificationError) {
      console.error("PROVIDER NOTIFICATION ERROR:", notificationError.message);
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.status(201).json({
      success: true,

      message: "Payment successful",

      payment,
    });
  } catch (error) {
    console.error("CREATE PAYMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET MY PAYMENTS
// Customer + Provider
// =====================================================

const getMyPayments = async (req, res) => {
  try {
    let query = {};

    // -------------------------------------------------
    // CUSTOMER
    // -------------------------------------------------

    if (req.user.role === "customer") {
      const customer = await Customer.findOne({
        user: req.user._id,
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer profile not found",
        });
      }

      query.customer = customer._id;
    }

    // -------------------------------------------------
    // PROVIDER
    // -------------------------------------------------

    if (req.user.role === "provider") {
      const provider = await ServiceProvider.findOne({
        user: req.user._id,
      });

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: "Provider profile not found",
        });
      }

      query.provider = provider._id;
    }

    // -------------------------------------------------
    // ONLY SUCCESSFUL PAYMENTS
    // -------------------------------------------------

    query.status = "Success";

    // -------------------------------------------------
    // GET PAYMENTS
    // -------------------------------------------------

    const payments = await Payment.find(query)
      .populate({
        path: "booking",

        populate: [
          {
            path: "service",

            select: "name price location",
          },

          {
            path: "customer",

            populate: {
              path: "user",

              select: "name email phone",
            },
          },

          {
            path: "provider",

            populate: {
              path: "user",

              select: "name email phone",
            },
          },
        ],
      })
      .populate({
        path: "customer",

        populate: {
          path: "user",

          select: "name email phone",
        },
      })
      .populate({
        path: "provider",

        populate: {
          path: "user",

          select: "name email phone",
        },
      })
      .sort({
        paidAt: -1,
      });

    // -------------------------------------------------
    // CALCULATE TOTAL EARNINGS
    // -------------------------------------------------

    const totalEarnings = payments.reduce((total, payment) => {
      return total + Number(payment.amount || 0);
    }, 0);

    // -------------------------------------------------
    // NUMBER OF PAYMENTS
    // -------------------------------------------------

    const completedPayments = payments.length;

    // -------------------------------------------------
    // AVERAGE PAYMENT
    // -------------------------------------------------

    const averagePerJob =
      completedPayments > 0 ? totalEarnings / completedPayments : 0;

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.status(200).json({
      success: true,

      count: payments.length,

      summary: {
        totalEarnings,

        completedPayments,

        averagePerJob: Math.round(averagePerJob * 100) / 100,
      },

      payments,
    });
  } catch (error) {
    console.error("GET PAYMENTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE PAYMENT
// =====================================================

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: "booking",

        populate: [
          {
            path: "service",
          },

          {
            path: "customer",

            populate: {
              path: "user",

              select: "name email phone",
            },
          },

          {
            path: "provider",

            populate: {
              path: "user",

              select: "name email phone",
            },
          },
        ],
      })
      .populate({
        path: "customer",

        populate: {
          path: "user",

          select: "name email phone",
        },
      })
      .populate({
        path: "provider",

        populate: {
          path: "user",

          select: "name email phone",
        },
      });

    // -------------------------------------------------
    // PAYMENT NOT FOUND
    // -------------------------------------------------

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // -------------------------------------------------
    // CUSTOMER OWNERSHIP
    // -------------------------------------------------

    if (req.user.role === "customer") {
      const customer = await Customer.findOne({
        user: req.user._id,
      });

      if (
        !customer ||
        payment.customer._id.toString() !== customer._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own payments",
        });
      }
    }

    // -------------------------------------------------
    // PROVIDER OWNERSHIP
    // -------------------------------------------------

    if (req.user.role === "provider") {
      const provider = await ServiceProvider.findOne({
        user: req.user._id,
      });

      if (
        !provider ||
        payment.provider._id.toString() !== provider._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own payments",
        });
      }
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("GET PAYMENT BY ID ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createPayment,
  getMyPayments,
  getPaymentById,
};
