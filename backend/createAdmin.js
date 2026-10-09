const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Admin = require("./models/Admin");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const email = "admin@skillconnect.com";
    const password = "Admin@123";
    const name = "SkillConnect Admin";
    const phone = "9999999999";

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });

    if (user) {
      // Update the existing admin account
      user.name = name;
      user.phone = phone;
      user.password = hashedPassword;
      user.role = "admin";

      await user.save();

      console.log("Existing admin account updated.");
    } else {
      // Create a new admin account
      user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: "admin",
      });

      console.log("New admin account created.");
    }

    // Ensure the Admin profile exists
    await Admin.findOneAndUpdate(
      { user: user._id },
      { $setOnInsert: { user: user._id } },
      { upsert: true, new: true },
    );

    console.log("Admin setup completed.");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
