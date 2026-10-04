const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
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

  date: {
    type: Date,
    required: true,
  },

  timeSlots: [
    {
      startTime: {
        type: String,
        required: true,
      },

      endTime: {
        type: String,
        required: true,
      },

      isBooked: {
        type: Boolean,
        default: false,
      },
    },
  ],

  isAvailable: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Availability", availabilitySchema);
