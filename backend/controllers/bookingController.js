const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const ServiceProvider = require("../models/ServiceProvider");
const Service = require("../models/Service");
const Availability = require("../models/Availability");
const generateNotification = require("../utils/generateNotification");

// =====================================================
// CREATE BOOKING
// =====================================================

const createBooking = async (req, res) => {
  try {
    const { service, bookingDate, startTime, endTime } = req.body;

    if (!service || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Service, date and time slot are required",
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

    const serviceData = await Service.findById(service);

    if (!serviceData || !serviceData.isActive) {
      return res.status(404).json({
        success: false,
        message: "Service not found or inactive",
      });
    }

    const availability = await Availability.findOne({
      service,
      date: new Date(bookingDate),
      isAvailable: true,
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "No availability found for this date",
      });
    }

    const slot = availability.timeSlots.find(
      (slot) =>
        slot.startTime === startTime &&
        slot.endTime === endTime &&
        !slot.isBooked,
    );

    if (!slot) {
      return res.status(400).json({
        success: false,
        message: "Selected time slot is not available",
      });
    }

    // Mark slot as booked
    slot.isBooked = true;

    await availability.save();

    // Create booking
    const booking = await Booking.create({
      customer: customer._id,
      provider: serviceData.provider,
      service: serviceData._id,
      bookingDate,
      timeSlot: {
        startTime,
        endTime,
      },
      amount: serviceData.price,
      status: "Pending",
      paymentStatus: "Pending",
    });

    // Notify provider
    const providerProfile = await ServiceProvider.findById(
      serviceData.provider,
    );

    if (providerProfile) {
      await generateNotification({
        recipient: providerProfile.user,
        type: "Booking",
        title: "New Booking Request",
        message: "You have received a new booking request.",
        relatedBooking: booking._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET MY BOOKINGS
// Customer + Provider
// =====================================================

const getMyBookings = async (req, res) => {
  try {
    let query = {};

    // CUSTOMER
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

    // PROVIDER
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

    const bookings = await Booking.find(query)
      .populate({
        path: "customer",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      })
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      })
      .populate("service")
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE BOOKING
// =====================================================

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "customer",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      })
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name email phone role",
        },
      })
      .populate("service");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // CUSTOMER OWNERSHIP
    if (req.user.role === "customer") {
      const customer = await Customer.findOne({
        user: req.user._id,
      });

      if (
        !customer ||
        booking.customer._id.toString() !== customer._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own bookings",
        });
      }
    }

    // PROVIDER OWNERSHIP
    if (req.user.role === "provider") {
      const provider = await ServiceProvider.findOne({
        user: req.user._id,
      });

      if (
        !provider ||
        booking.provider._id.toString() !== provider._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own bookings",
        });
      }
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("GET BOOKING ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ACCEPT BOOKING
// =====================================================

const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider || booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own bookings",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be accepted",
      });
    }

    booking.status = "Accepted";

    await booking.save();

    // Notify customer
    const customerProfile = await Customer.findById(booking.customer);

    if (customerProfile) {
      await generateNotification({
        recipient: customerProfile.user,
        type: "BookingStatus",
        title: "Booking Accepted",
        message: "Your booking has been accepted by the service provider.",
        relatedBooking: booking._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    console.error("ACCEPT BOOKING ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// REJECT BOOKING
// =====================================================

const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider || booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own bookings",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be rejected",
      });
    }

    booking.status = "Rejected";

    await booking.save();

    // Make the time slot available again
    await Availability.updateOne(
      {
        service: booking.service,
        date: new Date(booking.bookingDate),
        "timeSlots.startTime": booking.timeSlot.startTime,
        "timeSlots.endTime": booking.timeSlot.endTime,
      },
      {
        $set: {
          "timeSlots.$.isBooked": false,
        },
      },
    );

    // Notify customer
    const customerProfile = await Customer.findById(booking.customer);

    if (customerProfile) {
      await generateNotification({
        recipient: customerProfile.user,
        type: "BookingStatus",
        title: "Booking Rejected",
        message: "Your booking has been rejected by the service provider.",
        relatedBooking: booking._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      booking,
    });
  } catch (error) {
    console.error("REJECT BOOKING ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// CANCEL BOOKING
// =====================================================

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const customer = await Customer.findOne({
      user: req.user._id,
    });

    if (!customer || booking.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own bookings",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be cancelled",
      });
    }

    booking.status = "Cancelled";

    await booking.save();

    // Make time slot available again
    await Availability.updateOne(
      {
        service: booking.service,
        date: new Date(booking.bookingDate),
        "timeSlots.startTime": booking.timeSlot.startTime,
        "timeSlots.endTime": booking.timeSlot.endTime,
      },
      {
        $set: {
          "timeSlots.$.isBooked": false,
        },
      },
    );

    // Notify provider
    const providerProfile = await ServiceProvider.findById(booking.provider);

    if (providerProfile) {
      await generateNotification({
        recipient: providerProfile.user,
        type: "BookingStatus",
        title: "Booking Cancelled",
        message: "A customer has cancelled their booking.",
        relatedBooking: booking._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// COMPLETE BOOKING
// =====================================================

const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer")
      .populate("provider")
      .populate("service");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // -------------------------------------------------
    // PROVIDER OWNERSHIP
    // -------------------------------------------------

    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (
      !provider ||
      booking.provider._id.toString() !== provider._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own bookings",
      });
    }

    // -------------------------------------------------
    // CHECK STATUS
    // -------------------------------------------------

    if (booking.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted bookings can be completed",
      });
    }

    // -------------------------------------------------
    // MARK BOOKING COMPLETED
    // -------------------------------------------------

    booking.status = "Completed";

    await booking.save();

    // -------------------------------------------------
    // CREATE SUCCESSFUL PAYMENT
    // -------------------------------------------------

    let payment = await Payment.findOne({
      booking: booking._id,
    });

    if (!payment) {
      const transactionId =
        "TXN-" + Date.now() + "-" + Math.floor(Math.random() * 10000);

      payment = await Payment.create({
        booking: booking._id,
        customer: booking.customer._id,
        provider: booking.provider._id,
        amount: booking.amount,
        paymentMethod: "Demo Cash",
        transactionId,
        status: "Success",
        paidAt: new Date(),
      });
    }

    // -------------------------------------------------
    // UPDATE BOOKING PAYMENT STATUS
    // -------------------------------------------------

    booking.paymentStatus = "Paid";

    await booking.save();

    // -------------------------------------------------
    // NOTIFY CUSTOMER
    // -------------------------------------------------

    try {
      await generateNotification({
        recipient: booking.customer.user,
        type: "BookingStatus",
        title: "Booking Completed",
        message: `Your ${booking.service?.name || "service"} booking has been completed successfully.`,
        relatedBooking: booking._id,
      });
    } catch (notificationError) {
      console.error(
        "CUSTOMER COMPLETION NOTIFICATION ERROR:",
        notificationError.message,
      );
    }

    // -------------------------------------------------
    // NOTIFY CUSTOMER ABOUT PAYMENT
    // -------------------------------------------------

    try {
      await generateNotification({
        recipient: booking.customer.user,
        type: "Payment",
        title: "Payment Successful",
        message: `Payment of ₹${booking.amount} has been recorded successfully.`,
        relatedBooking: booking._id,
      });
    } catch (notificationError) {
      console.error(
        "CUSTOMER PAYMENT NOTIFICATION ERROR:",
        notificationError.message,
      );
    }

    // -------------------------------------------------
    // NOTIFY PROVIDER ABOUT EARNINGS
    // -------------------------------------------------

    try {
      await generateNotification({
        recipient: booking.provider.user,
        type: "Payment",
        title: "Payment Received",
        message: `You earned ₹${booking.amount} from ${booking.service?.name || "your service"}.`,
        relatedBooking: booking._id,
      });
    } catch (notificationError) {
      console.error(
        "PROVIDER PAYMENT NOTIFICATION ERROR:",
        notificationError.message,
      );
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.status(200).json({
      success: true,
      message: "Booking completed and payment recorded successfully",
      booking,
      payment,
    });
  } catch (error) {
    console.error("COMPLETE BOOKING ERROR:", error);

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
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
};
