const express = require("express");

const {
  createMessage,
  getBookingConversation,
  getConversationMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
} = require("../controllers/messageController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   BOOKING CHAT
===================================================== */

router.get("/booking/:bookingId", protect, getBookingConversation);

/* =====================================================
   SINGLE MESSAGE
   IMPORTANT: Keep these before /:conversationId
===================================================== */

router.get("/message/:id", protect, getMessageById);

router.put("/message/:id", protect, updateMessage);

router.delete("/message/:id", protect, deleteMessage);

/* =====================================================
   NORMAL CONVERSATION
===================================================== */

router.get("/:conversationId", protect, getConversationMessages);

/* =====================================================
   CREATE MESSAGE
===================================================== */

router.post("/", protect, createMessage);

module.exports = router;
