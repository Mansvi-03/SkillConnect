const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema({
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

  bio: {
    type: String,
    trim: true,
  },

  profileImage: {
    type: String,
  },
});

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);
