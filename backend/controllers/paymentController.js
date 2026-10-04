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

    if (!booking || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Booking and payment method are required",
      });
    }

    const customer = await Customer.findOne({
      user: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const bookingData = await Booking.findById(booking);

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (bookingData.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own bookings",
      });
    }

    if (bookingData.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Payment is allowed only for accepted bookings",
      });
    }

    if (bookingData.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid",
      });
    }

    const existingPayment = await Payment.findOne({
      booking: bookingData._id,
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this booking",
      });
    }

    const transactionId =
      "TXN-" + Date.now() + "-" + Math.floor(Math.random() * 10000);

    const payment = await Payment.create({
      booking: bookingData._id,
      customer: bookingData.customer,
      provider: bookingData.provider,
      amount: bookingData.amount,
      paymentMethod,
      transactionId,
      status: "Success",
      paidAt: new Date(),
    });

    bookingData.paymentStatus = "Paid";

    await bookingData.save();

    // Payment notification
    const customerProfile = await Customer.findById(bookingData.customer);

    if (customerProfile) {
      await generateNotification({
        recipient: customerProfile.user,
        type: "Payment",
        title: "Payment Successful",
        message: `Your payment of ₹${bookingData.amount} was successful.`,
        relatedBooking: bookingData._id,
      });
    }

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
// Customer → own payments
// Provider → payments received for own services
// =====================================================

const getMyPayments = async (req, res) => {
  try {
    let query = {};

    // -----------------------------------------------
    // CUSTOMER
    // -----------------------------------------------

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

    // -----------------------------------------------
    // PROVIDER
    // -----------------------------------------------

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

    // -----------------------------------------------
    // GET PAYMENTS
    // -----------------------------------------------

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
      .sort({ paidAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("GET MY PAYMENTS ERROR:", error);

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
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // -----------------------------------------------
    // CUSTOMER OWNERSHIP
    // -----------------------------------------------

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

    // -----------------------------------------------
    // PROVIDER OWNERSHIP
    // -----------------------------------------------

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

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("GET PAYMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getMyPayments,
  getPaymentById,
};
