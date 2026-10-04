const Availability = require("../models/Availability");
const ServiceProvider = require("../models/ServiceProvider");
const Service = require("../models/Service");

// =====================================================
// CREATE AVAILABILITY
// =====================================================
const createAvailability = async (req, res) => {
  try {
    const { service, date, timeSlots } = req.body;

    if (!service || !date || !timeSlots) {
      return res.status(400).json({
        success: false,
        message: "Service, date and time slots are required",
      });
    }

    if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one time slot is required",
      });
    }

    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const serviceExists = await Service.findOne({
      _id: service,
      provider: provider._id,
    });

    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: "Service not found or does not belong to you",
      });
    }

    const availability = await Availability.create({
      provider: provider._id,
      service,
      date,
      timeSlots: timeSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: false,
      })),
      isAvailable: true,
    });

    res.status(201).json({
      success: true,
      message: "Availability created successfully",
      availability,
    });
  } catch (error) {
    console.error("CREATE AVAILABILITY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET PROVIDER AVAILABILITY
// =====================================================
const getProviderAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({
      provider: req.params.providerId,
    })
      .populate("service")
      .sort({
        date: 1,
      });

    res.status(200).json({
      success: true,
      count: availability.length,
      availability,
    });
  } catch (error) {
    console.error("GET PROVIDER AVAILABILITY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SERVICE AVAILABILITY
// =====================================================
const getServiceAvailability = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const service = await Service.findOne({
      _id: serviceId,
      provider: provider._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or does not belong to you",
      });
    }

    const availability = await Availability.find({
      service: serviceId,
      provider: provider._id,
    })
      .populate("service")
      .sort({
        date: 1,
      });

    res.status(200).json({
      success: true,
      count: availability.length,
      availability,
    });
  } catch (error) {
    console.error("GET SERVICE AVAILABILITY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE AVAILABILITY
// =====================================================
const getAvailabilityById = async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id).populate(
      "service",
    );

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    console.error("GET AVAILABILITY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE AVAILABILITY
// =====================================================
const updateAvailability = async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (
      !provider ||
      availability.provider.toString() !== provider._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own availability",
      });
    }

    const { date, timeSlots, isAvailable } = req.body;

    if (date !== undefined) {
      availability.date = date;
    }

    if (timeSlots !== undefined) {
      availability.timeSlots = timeSlots;
    }

    if (isAvailable !== undefined) {
      availability.isAvailable = isAvailable;
    }

    await availability.save();

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      availability,
    });
  } catch (error) {
    console.error("UPDATE AVAILABILITY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE AVAILABILITY
// =====================================================
const deleteAvailability = async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (
      !provider ||
      availability.provider.toString() !== provider._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own availability",
      });
    }

    await availability.deleteOne();

    res.status(200).json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    console.error("DELETE AVAILABILITY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// CUSTOMER - CHECK SERVICE AVAILABILITY
// =====================================================
const checkServiceAvailability = async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: "Service ID and date are required",
      });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const availability = await Availability.findOne({
      service: serviceId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      isAvailable: true,
    }).populate({
      path: "service",
      select: "name price location",
    });

    if (!availability) {
      return res.status(200).json({
        success: true,
        message: "No availability found for this date",
        availability: null,
        availableSlots: [],
      });
    }

    const availableSlots = availability.timeSlots.filter(
      (slot) => !slot.isBooked,
    );

    res.status(200).json({
      success: true,
      service: availability.service,
      date: availability.date,
      availableSlots,
    });
  } catch (error) {
    console.error("CHECK SERVICE AVAILABILITY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  createAvailability,
  getProviderAvailability,
  getServiceAvailability,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
  checkServiceAvailability,
};
