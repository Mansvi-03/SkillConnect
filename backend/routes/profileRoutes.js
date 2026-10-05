const express = require("express");

const {
  getProfile,
  createProfile,
  updateProfile,
  changePassword,
  deleteProfile,
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// =====================================================
// GET PROFILE
// =====================================================

router.get("/:userId", protect, getProfile);

// =====================================================
// CREATE PROFILE
// =====================================================

router.post("/", protect, upload.single("profileImage"), createProfile);

// =====================================================
// UPDATE PROFILE
// =====================================================

router.put("/:userId", protect, upload.single("profileImage"), updateProfile);

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put("/:userId/change-password", protect, changePassword);

// =====================================================
// DELETE ACCOUNT
// =====================================================

router.delete("/:userId", protect, deleteProfile);

module.exports = router;
