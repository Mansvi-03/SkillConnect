const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  address: {
    type: String,
    trim: true,
  },

  city: {
    type: String,
    trim: true,
  },

  profileImage: {
    type: String,
  },
});

module.exports = mongoose.model("Customer", customerSchema);
