const User = require("../models/User");
const Customer = require("../models/Customer");
const ServiceProvider = require("../models/ServiceProvider");
const Admin = require("../models/Admin");

// ==========================================
// GET PROFILE
// ==========================================
// GET PROFILE
const getProfile = async (req, res) => {
  try {
    // If /me is used, get the logged-in user's ID from JWT.
    // If /:userId is used, get the ID from the URL.
    const userId = req.params.userId || req.user._id;

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

// ==========================================
// CREATE PROFILE
// ==========================================
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

    const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    // ==========================
    // CUSTOMER
    // ==========================
    if (user.role === "customer") {
      const existingProfile = await Customer.findOne({
        user: user._id,
      });

      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: "Customer profile already exists",
        });
      }

      const profile = await Customer.create({
        user: user._id,
        address: address || "",
        city: city || "",
        profileImage,
      });

      return res.status(201).json({
        success: true,
        message: "Customer profile created successfully",
        profile,
      });
    }

    // ==========================
    // SERVICE PROVIDER
    // ==========================
    if (user.role === "provider") {
      const existingProfile = await ServiceProvider.findOne({
        user: user._id,
      });

      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: "Provider profile already exists",
        });
      }

      const profile = await ServiceProvider.create({
        user: user._id,
        address: address || "",
        city: city || "",
        bio: bio || "",
        profileImage,
      });

      return res.status(201).json({
        success: true,
        message: "Provider profile created successfully",
        profile,
      });
    }

    // ==========================
    // ADMIN
    // ==========================
    return res.status(400).json({
      success: false,
      message: "Admin does not have a separate profile",
    });
  } catch (error) {
    console.error("CREATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, phone, address, city, bio } = req.body;

    // ==========================
    // UPDATE USER
    // ==========================

    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    await user.save();

    // ==========================
    // UPDATE CUSTOMER
    // ==========================

    if (user.role === "customer") {
      let customer = await Customer.findOne({
        user: user._id,
      });

      // Create profile automatically if missing
      if (!customer) {
        customer = await Customer.create({
          user: user._id,
          address: address || "",
          city: city || "",
        });
      }

      if (address !== undefined) {
        customer.address = address;
      }

      if (city !== undefined) {
        customer.city = city;
      }

      if (req.file) {
        customer.profileImage = `/uploads/${req.file.filename}`;
      }

      await customer.save();
    }

    // ==========================
    // UPDATE PROVIDER
    // ==========================

    if (user.role === "provider") {
      let provider = await ServiceProvider.findOne({
        user: user._id,
      });

      // Create profile automatically if missing
      if (!provider) {
        provider = await ServiceProvider.create({
          user: user._id,
          address: address || "",
          city: city || "",
          bio: bio || "",
        });
      }

      if (address !== undefined) {
        provider.address = address;
      }

      if (city !== undefined) {
        provider.city = city;
      }

      if (bio !== undefined) {
        provider.bio = bio;
      }

      if (req.file) {
        provider.profileImage = `/uploads/${req.file.filename}`;
      }

      await provider.save();
    }

    // ==========================
    // RETURN UPDATED PROFILE
    // ==========================

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

    const updatedUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
      profile,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE PROFILE
// ==========================================
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete customer profile
    if (user.role === "customer") {
      await Customer.findOneAndDelete({
        user: user._id,
      });
    }

    // Delete provider profile
    if (user.role === "provider") {
      await ServiceProvider.findOneAndDelete({
        user: user._id,
      });
    }

    // Delete admin profile
    if (user.role === "admin") {
      await Admin.findOneAndDelete({
        user: user._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
};
