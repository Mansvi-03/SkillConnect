const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must contain at least 2 characters"],
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },

  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must contain at least 6 characters"],
  },

  role: {
    type: String,
    enum: ["customer", "provider", "admin"],
    required: true,
    default: "customer",
  },
});

module.exports = mongoose.model("User", userSchema);
