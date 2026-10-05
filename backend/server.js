const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();

// =====================================================
// DATABASE
// =====================================================

const connectDB = require("./config/db");

// =====================================================
// ERROR MIDDLEWARE
// =====================================================

const errorMiddleware = require("./middleware/errorMiddleware");

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const profileRoutes = require("./routes/profileRoutes");

const adminRoutes = require("./routes/adminRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");

const providerRoutes = require("./routes/providerRoutes");
const customerRoutes = require("./routes/customerRoutes");

// =====================================================
// MODELS
// =====================================================

const Message = require("./models/Message");

// =====================================================
// DATABASE CONNECTION
// =====================================================

connectDB();

// =====================================================
// EXPRESS APP
// =====================================================

const app = express();

// =====================================================
// HTTP SERVER
// =====================================================

const server = http.createServer(app);

// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// =====================================================
// GLOBAL MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use("/uploads", express.static("uploads"));

// =====================================================
// ROOT ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to SkillConnect Backend API",
  });
});

// =====================================================
// API ROUTES
// =====================================================

// Authentication
app.use("/api/auth", authRoutes);

// Users
app.use("/api/users", userRoutes);

// Categories
app.use("/api/categories", categoryRoutes);

// Services
app.use("/api/services", serviceRoutes);

// Availability
app.use("/api/availability", availabilityRoutes);

// Bookings
app.use("/api/bookings", bookingRoutes);

// Payments
app.use("/api/payments", paymentRoutes);

// Reviews
app.use("/api/reviews", reviewRoutes);

// Messages
app.use("/api/messages", messageRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// Profiles
app.use("/api/profiles", profileRoutes);

// =====================================================
// ADMIN ROUTES
// =====================================================

app.use("/api/admin", adminRoutes);

app.use("/api/admin/dashboard", adminDashboardRoutes);

// =====================================================
// PROVIDER ROUTES
// =====================================================

app.use("/api/provider", providerRoutes);

// =====================================================
// CUSTOMER ROUTES
// =====================================================

app.use("/api/customer", customerRoutes);

// =====================================================
// SOCKET.IO CHAT
// =====================================================

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ===================================================
  // JOIN CONVERSATION
  // ===================================================

  socket.on("joinConversation", (conversationId) => {
    if (!conversationId) {
      return;
    }

    socket.join(conversationId);

    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // ===================================================
  // SEND MESSAGE
  // ===================================================

  socket.on("sendMessage", async (data) => {
    try {
      const { conversationId, sender, receiver, message } = data;

      // -----------------------------------------------
      // VALIDATE MESSAGE
      // -----------------------------------------------

      if (
        !conversationId ||
        !sender ||
        !receiver ||
        !message ||
        !message.trim()
      ) {
        socket.emit("messageError", {
          success: false,
          message: "All message fields are required",
        });

        return;
      }

      // -----------------------------------------------
      // SAVE MESSAGE
      // -----------------------------------------------

      const savedMessage = await Message.create({
        conversationId,
        sender,
        receiver,
        message: message.trim(),
      });

      // -----------------------------------------------
      // POPULATE MESSAGE
      // -----------------------------------------------

      const populatedMessage = await Message.findById(savedMessage._id)
        .populate("sender", "name email role")
        .populate("receiver", "name email role");

      // -----------------------------------------------
      // SEND TO CONVERSATION
      // -----------------------------------------------

      io.to(conversationId).emit("receiveMessage", populatedMessage);

      console.log(`Message sent in conversation ${conversationId}`);
    } catch (error) {
      console.error("SOCKET MESSAGE ERROR:", error);

      socket.emit("messageError", {
        success: false,
        message: error.message || "Unable to send message",
      });
    }
  });

  // ===================================================
  // DISCONNECT
  // ===================================================

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorMiddleware);

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
