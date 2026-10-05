const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Customer = require("../models/Customer");
const ServiceProvider = require("../models/ServiceProvider");
const Admin = require("../models/Admin");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Service = require("../models/Service");
const Availability = require("../models/Availability");

// =====================================================
// GET PROFILE
// =====================================================

const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    // User can only view their own profile
    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own profile",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profile = null;

    if (user.role === "customer") {
      profile = await Customer.findOne({
        user: user._id,
      });
    }

    if (user.role === "provider") {
      profile = await ServiceProvider.findOne({
        user: user._id,
      });
    }

    if (user.role === "admin") {
      profile = await Admin.findOne({
        user: user._id,
      });
    }

    res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// CREATE PROFILE
// =====================================================

const createProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { address, city, bio } = req.body;

    let profile;

    if (user.role === "customer") {
      const existingProfile = await Customer.findOne({
        user: userId,
      });

      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: "Customer profile already exists",
        });
      }

      profile = await Customer.create({
        user: userId,
        address,
        city,
      });
    }

    if (user.role === "provider") {
      const existingProfile = await ServiceProvider.findOne({
        user: userId,
      });

      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: "Provider profile already exists",
        });
      }

      profile = await ServiceProvider.create({
        user: userId,
        address,
        city,
        bio,
      });
    }

    if (user.role === "admin") {
      const existingProfile = await Admin.findOne({
        user: userId,
      });

      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: "Admin profile already exists",
        });
      }

      profile = await Admin.create({
        user: userId,
      });
    }

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("CREATE PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Own profile only
    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, phone, address, city, bio } = req.body;

    // -------------------------------------------------
    // UPDATE USER
    // -------------------------------------------------

    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    await user.save();

    // -------------------------------------------------
    // UPDATE CUSTOMER PROFILE
    // -------------------------------------------------

    if (user.role === "customer") {
      const customer = await Customer.findOne({
        user: userId,
      });

      if (customer) {
        if (address !== undefined) {
          customer.address = address;
        }

        if (city !== undefined) {
          customer.city = city;
        }

        await customer.save();
      }
    }

    // -------------------------------------------------
    // UPDATE PROVIDER PROFILE
    // -------------------------------------------------

    if (user.role === "provider") {
      const provider = await ServiceProvider.findOne({
        user: userId,
      });

      if (provider) {
        if (address !== undefined) {
          provider.address = address;
        }

        if (city !== undefined) {
          provider.city = city;
        }

        if (bio !== undefined) {
          provider.bio = bio;
        }

        await provider.save();
      }
    }

    const updatedUser = await User.findById(userId).select("-password");

    let updatedProfile = null;

    if (user.role === "customer") {
      updatedProfile = await Customer.findOne({
        user: userId,
      });
    }

    if (user.role === "provider") {
      updatedProfile = await ServiceProvider.findOne({
        user: userId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE ACCOUNT
// =====================================================
//
// Rules:
//
// Pending     -> Cancelled
// Accepted    -> BLOCK deletion
// Completed   -> Keep history
// Rejected    -> Keep history
// Cancelled   -> Keep history
//
// User + profile are deleted.
// Historical bookings/payments/reviews remain.
//
// =====================================================

const deleteProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    // -------------------------------------------------
    // OWN ACCOUNT ONLY
    // -------------------------------------------------

    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own account",
      });
    }

    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -------------------------------------------------
    // ADMIN CANNOT DELETE THROUGH PROFILE
    // -------------------------------------------------

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted from this page",
      });
    }

    // =================================================
    // CUSTOMER ACCOUNT
    // =================================================

    if (user.role === "customer") {
      const customer = await Customer.findOne({
        user: userId,
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer profile not found",
        });
      }

      // ------------------------------------------------
      // CHECK ACTIVE BOOKINGS
      // ------------------------------------------------
      // Accepted = active/in-progress.
      // Customer must wait until service is completed.

      const activeBooking = await Booking.findOne({
        customer: customer._id,
        status: "Accepted",
      });

      if (activeBooking) {
        return res.status(400).json({
          success: false,
          canDelete: false,
          message:
            "You cannot delete your account while you have an active service. Please wait until the service is completed.",
        });
      }

      // ------------------------------------------------
      // CANCEL PENDING BOOKINGS
      // ------------------------------------------------

      const pendingBookings = await Booking.find({
        customer: customer._id,
        status: "Pending",
      });

      for (const booking of pendingBookings) {
        booking.status = "Cancelled";

        await booking.save();

        // Make slot available again
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
      }

      // ------------------------------------------------
      // DELETE CUSTOMER PROFILE
      // ------------------------------------------------

      await Customer.deleteOne({
        _id: customer._id,
      });

      // ------------------------------------------------
      // DELETE USER
      // ------------------------------------------------

      await User.deleteOne({
        _id: userId,
      });

      return res.status(200).json({
        success: true,
        message:
          "Customer account deleted successfully. Pending bookings were cancelled and completed history was preserved.",
      });
    }

    // =================================================
    // PROVIDER ACCOUNT
    // =================================================

    if (user.role === "provider") {
      const provider = await ServiceProvider.findOne({
        user: userId,
      });

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: "Service provider profile not found",
        });
      }

      // ------------------------------------------------
      // CHECK ACTIVE BOOKINGS
      // ------------------------------------------------

      const activeBooking = await Booking.findOne({
        provider: provider._id,
        status: "Accepted",
      });

      if (activeBooking) {
        return res.status(400).json({
          success: false,
          canDelete: false,
          message:
            "You cannot delete your account while you have an active service. Please complete the service first.",
        });
      }

      // ------------------------------------------------
      // CANCEL PENDING BOOKINGS
      // ------------------------------------------------

      const pendingBookings = await Booking.find({
        provider: provider._id,
        status: "Pending",
      });

      for (const booking of pendingBookings) {
        booking.status = "Cancelled";

        await booking.save();

        // Make slot available again
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
      }

      // ------------------------------------------------
      // REMOVE PROVIDER SERVICES
      // ------------------------------------------------
      //
      // Historical bookings are NOT deleted.
      // Completed payments remain.
      // Reviews remain.
      //
      // Services themselves can be removed because
      // the provider account no longer exists.

      await Service.deleteMany({
        provider: provider._id,
      });

      // ------------------------------------------------
      // REMOVE PROVIDER AVAILABILITY
      // ------------------------------------------------

      await Availability.deleteMany({
        provider: provider._id,
      });

      // ------------------------------------------------
      // DELETE PROVIDER PROFILE
      // ------------------------------------------------

      await ServiceProvider.deleteOne({
        _id: provider._id,
      });

      // ------------------------------------------------
      // DELETE USER
      // ------------------------------------------------

      await User.deleteOne({
        _id: userId,
      });

      return res.status(200).json({
        success: true,
        message:
          "Service provider account deleted successfully. Pending bookings were cancelled and completed history was preserved.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid account role",
    });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete account",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  changePassword,
  deleteProfile,
};
