const Message = require("../models/Message");
const Booking = require("../models/Booking");

/* =====================================================
   CREATE MESSAGE
===================================================== */

const createMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body;

    if (!receiver || !message) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message are required",
      });
    }

    const sender = req.user._id;

    const conversationId = [sender.toString(), receiver.toString()]
      .sort()
      .join("_");

    const newMessage = await Message.create({
      conversationId,
      sender,
      receiver,
      message,
    });

    await newMessage.populate("sender", "name email role");

    await newMessage.populate("receiver", "name email role");

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("CREATE MESSAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET BOOKING CONVERSATION
===================================================== */

const getBookingConversation = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    /* -----------------------------------------------
       Find booking
    ------------------------------------------------ */

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "customer",
        populate: {
          path: "user",
          select: "name email role",
        },
      })
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name email role",
        },
      })
      .populate("service");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    /* -----------------------------------------------
       Check access
    ------------------------------------------------ */

    let allowed = false;

    if (req.user.role === "customer") {
      if (booking.customer?.user?._id?.toString() === req.user._id.toString()) {
        allowed = true;
      }
    }

    if (req.user.role === "provider") {
      if (booking.provider?.user?._id?.toString() === req.user._id.toString()) {
        allowed = true;
      }
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this conversation",
      });
    }

    /* -----------------------------------------------
       Conversation ID
    ------------------------------------------------ */

    const conversationId = `booking_${booking._id}`;

    /* -----------------------------------------------
       Get messages
    ------------------------------------------------ */

    const messages = await Message.find({
      conversationId,
    })
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      booking,
      service: booking.service,
      customer: booking.customer,
      provider: booking.provider,
      conversationId,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("GET BOOKING CONVERSATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET CONVERSATION MESSAGES
===================================================== */

const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversationId,
    })
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("GET CONVERSATION MESSAGES ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET SINGLE MESSAGE
===================================================== */

const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("sender", "name email role")
      .populate("receiver", "name email role");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const isSender = message.sender._id.toString() === req.user._id.toString();

    const isReceiver =
      message.receiver._id.toString() === req.user._id.toString();

    if (!isSender && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this message",
      });
    }

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("GET MESSAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UPDATE MESSAGE
===================================================== */

const updateMessage = async (req, res) => {
  try {
    const { message: newMessage } = req.body;

    if (!newMessage) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own messages",
      });
    }

    message.message = newMessage.trim();

    await message.save();

    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("UPDATE MESSAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   DELETE MESSAGE
===================================================== */

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("DELETE MESSAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  createMessage,
  getBookingConversation,
  getConversationMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
};
