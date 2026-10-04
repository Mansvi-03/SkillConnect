const Notification = require("../models/Notification");

const generateNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedBooking = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedBooking,
    });

    return notification;
  } catch (error) {
    console.error("Notification error:", error.message);
    return null;
  }
};

module.exports = generateNotification;
