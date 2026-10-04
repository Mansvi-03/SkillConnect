const express = require("express");

const {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Get logged-in user's profile
router.get("/me", protect, getProfile);

// Get profile by user ID
router.get("/:userId", protect, getProfile);

// Create profile
router.post("/", protect, upload.single("profileImage"), createProfile);

// Update profile
router.put("/:userId", protect, upload.single("profileImage"), updateProfile);

// Delete profile
router.delete("/:userId", protect, deleteProfile);

module.exports = router;
