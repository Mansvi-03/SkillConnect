const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },

  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
    required: true,
  },

  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },

  bookingDate: {
    type: Date,
    required: true,
  },

  timeSlot: {
    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },
  },

  amount: {
    type: Number,
    required: true,
    min: 0,
  },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Completed", "Cancelled"],
    default: "Pending",
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
