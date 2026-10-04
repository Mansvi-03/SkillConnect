const express = require("express");

const {
  createNotification,
  getMyNotifications,
  getNotificationById,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get my notifications
router.get("/", protect, getMyNotifications);

// Get single notification
router.get("/:id", protect, getNotificationById);

// Create notification
router.post("/", protect, authorize("admin"), createNotification);

// Mark notification as read
router.put("/:id/read", protect, markAsRead);

// Delete notification
router.delete("/:id", protect, deleteNotification);

module.exports = router;
