const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const errorMiddleware = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const providerRoutes = require("./routes/providerRoutes");
const customerRoutes = require("./routes/customerRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");

// Models
const Message = require("./models/Message");
const Booking = require("./models/Booking");
const Customer = require("./models/Customer");
const ServiceProvider = require("./models/ServiceProvider");

dotenv.config();

connectDB();

const app = express();

const server = http.createServer(app);

/* =====================================================
   SOCKET.IO
===================================================== */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

/* =====================================================
   ROOT
===================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to SkillConnect Backend API",
  });
});

/* =====================================================
   REST API ROUTES
===================================================== */

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/services", serviceRoutes);

app.use("/api/availability", availabilityRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/provider", providerRoutes);

app.use("/api/customer", customerRoutes);

app.use("/api/admin", adminDashboardRoutes);

app.use("/api/profiles", profileRoutes);

/* =====================================================
   SOCKET.IO CHAT
===================================================== */

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* ===================================================
     JOIN BOOKING CONVERSATION
  =================================================== */

  socket.on("joinConversation", async (data) => {
    try {
      const { bookingId, userId } = data;

      if (!bookingId || !userId) {
        socket.emit("messageError", {
          success: false,
          message: "Booking ID and User ID are required",
        });

        return;
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        socket.emit("messageError", {
          success: false,
          message: "Booking not found",
        });

        return;
      }

      const customer = await Customer.findById(booking.customer);

      const provider = await ServiceProvider.findById(booking.provider);

      if (!customer || !provider) {
        socket.emit("messageError", {
          success: false,
          message: "Booking participants not found",
        });

        return;
      }

      /* -----------------------------------------------
         Check whether user belongs to this booking
      ------------------------------------------------ */

      const customerUserId = customer.user.toString();

      const providerUserId = provider.user.toString();

      const currentUserId = userId.toString();

      const isCustomer = customerUserId === currentUserId;

      const isProvider = providerUserId === currentUserId;

      if (!isCustomer && !isProvider) {
        socket.emit("messageError", {
          success: false,
          message: "You are not a participant of this booking",
        });

        return;
      }

      /* -----------------------------------------------
         Booking-based conversation ID
      ------------------------------------------------ */

      const conversationId = `booking_${bookingId}`;

      socket.join(conversationId);

      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);

      socket.emit("conversationJoined", {
        success: true,
        conversationId,
        bookingId,
      });
    } catch (error) {
      console.error("JOIN CONVERSATION ERROR:", error);

      socket.emit("messageError", {
        success: false,
        message: error.message,
      });
    }
  });

  /* ===================================================
     SEND MESSAGE
  =================================================== */

  socket.on("sendMessage", async (data, callback) => {
    try {
      const { bookingId, senderId, message } = data;

      /* -----------------------------------------------
         Validate data
      ------------------------------------------------ */

      if (!bookingId || !senderId || !message) {
        const response = {
          success: false,
          message: "Booking ID, sender ID and message are required",
        };

        socket.emit("messageError", response);

        if (callback) {
          callback(response);
        }

        return;
      }

      const trimmedMessage = message.trim();

      if (!trimmedMessage) {
        const response = {
          success: false,
          message: "Message cannot be empty",
        };

        socket.emit("messageError", response);

        if (callback) {
          callback(response);
        }

        return;
      }

      /* -----------------------------------------------
         Find booking
      ------------------------------------------------ */

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        const response = {
          success: false,
          message: "Booking not found",
        };

        socket.emit("messageError", response);

        if (callback) {
          callback(response);
        }

        return;
      }

      /* -----------------------------------------------
         Find customer and provider
      ------------------------------------------------ */

      const customer = await Customer.findById(booking.customer);

      const provider = await ServiceProvider.findById(booking.provider);

      if (!customer || !provider) {
        const response = {
          success: false,
          message: "Booking participants not found",
        };

        socket.emit("messageError", response);

        if (callback) {
          callback(response);
        }

        return;
      }

      const customerUserId = customer.user.toString();

      const providerUserId = provider.user.toString();

      const currentUserId = senderId.toString();

      /* -----------------------------------------------
         Determine receiver
      ------------------------------------------------ */

      let receiverId;

      if (customerUserId === currentUserId) {
        receiverId = provider.user;
      } else if (providerUserId === currentUserId) {
        receiverId = customer.user;
      } else {
        const response = {
          success: false,
          message: "You are not a participant of this booking",
        };

        socket.emit("messageError", response);

        if (callback) {
          callback(response);
        }

        return;
      }

      /* -----------------------------------------------
         Conversation ID
      ------------------------------------------------ */

      const conversationId = `booking_${bookingId}`;

      /* -----------------------------------------------
         Save message
      ------------------------------------------------ */

      const savedMessage = await Message.create({
        conversationId,
        sender: senderId,
        receiver: receiverId,
        message: trimmedMessage,
      });

      /* -----------------------------------------------
         Populate sender and receiver
      ------------------------------------------------ */

      await savedMessage.populate("sender", "name email role");

      await savedMessage.populate("receiver", "name email role");

      /* -----------------------------------------------
         Send to everyone in this booking room
      ------------------------------------------------ */

      io.to(conversationId).emit("receiveMessage", savedMessage);

      /* -----------------------------------------------
         Success callback
      ------------------------------------------------ */

      if (callback) {
        callback({
          success: true,
          message: savedMessage,
        });
      }

      console.log(`Message sent in booking ${bookingId}`);
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);

      const response = {
        success: false,
        message: error.message,
      };

      socket.emit("messageError", response);

      if (callback) {
        callback(response);
      }
    }
  });

  /* ===================================================
     DISCONNECT
  =================================================== */

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* =====================================================
   ERROR MIDDLEWARE
===================================================== */

app.use(errorMiddleware);

/* =====================================================
   START SERVER
===================================================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
