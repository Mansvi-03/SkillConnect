const User = require("../models/User");
const Category = require("../models/Category");
const Service = require("../models/Service");

// =====================================================
// ADMIN DASHBOARD
// =====================================================

const getAdminDashboard = async (req, res) => {
  try {
    // Count all users
    const totalUsers = await User.countDocuments();

    // Count all categories
    const totalCategories = await Category.countDocuments();

    // Count all services
    const totalServices = await Service.countDocuments();

    res.status(200).json({
      success: true,

      totalUsers,
      totalCategories,
      totalServices,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard.",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
};
