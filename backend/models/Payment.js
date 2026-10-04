const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    unique: true,
  },

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

  amount: {
    type: Number,
    required: true,
    min: 0,
  },

  paymentMethod: {
    type: String,
    required: true,
    enum: ["Demo Card", "Demo UPI", "Demo Cash"],
  },

  transactionId: {
    type: String,
    required: true,
    unique: true,
  },

  status: {
    type: String,
    enum: ["Pending", "Success", "Failed"],
    default: "Pending",
  },

  paidAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
