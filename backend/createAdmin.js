const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Admin = require("./models/Admin");

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "admin@skillconnect.com";
    const password = "Admin@123";
    const name = "SkillConnect Admin";
    const phone = "9999999999"; // Required by User model

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "admin",
    });

    // Create Admin profile
    await Admin.create({
      user: user._id,
    });

    console.log("-----------------------------------");
    console.log("Admin created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Phone:", phone);
    console.log("Role: admin");
    console.log("-----------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exit(1);
  }
};

createAdmin();
