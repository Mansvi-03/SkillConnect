const User = require("../models/User");
const Customer = require("../models/Customer");
const ServiceProvider = require("../models/ServiceProvider");
const Admin = require("../models/Admin");

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ _id: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE USER
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, email, phone, role } = req.body;

    // Prevent admin from changing their own role
    if (
      user._id.toString() === req.user._id.toString() &&
      role &&
      role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own admin role",
      });
    }

    // Check duplicate email
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      user.email = email.toLowerCase();
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    const oldRole = user.role;

    if (role !== undefined) {
      user.role = role;
    }

    await user.save();

    // If role changed, fix role-specific profiles
    if (role && role !== oldRole) {
      // Remove old profile
      if (oldRole === "customer") {
        await Customer.findOneAndDelete({
          user: user._id,
        });
      }

      if (oldRole === "provider") {
        await ServiceProvider.findOneAndDelete({
          user: user._id,
        });
      }

      if (oldRole === "admin") {
        await Admin.findOneAndDelete({
          user: user._id,
        });
      }

      // Create new profile
      if (role === "customer") {
        await Customer.create({
          user: user._id,
        });
      }

      if (role === "provider") {
        await ServiceProvider.create({
          user: user._id,
        });
      }

      if (role === "admin") {
        await Admin.create({
          user: user._id,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
    }

    // Delete related profile
    if (user.role === "customer") {
      await Customer.findOneAndDelete({
        user: user._id,
      });
    }

    if (user.role === "provider") {
      await ServiceProvider.findOneAndDelete({
        user: user._id,
      });
    }

    if (user.role === "admin") {
      await Admin.findOneAndDelete({
        user: user._id,
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
