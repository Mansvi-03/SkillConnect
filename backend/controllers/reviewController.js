const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Service = require("../models/Service");

// =====================================================
// CREATE REVIEW
// =====================================================

const createReview = async (req, res) => {
  try {
    const { booking, rating, reviewText } = req.body;

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!booking || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Booking and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!reviewText || !reviewText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review text is required",
      });
    }

    // -----------------------------------------------
    // FIND CUSTOMER
    // -----------------------------------------------

    const customer = await Customer.findOne({
      user: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    // -----------------------------------------------
    // FIND BOOKING
    // -----------------------------------------------

    const bookingData = await Booking.findById(booking)
      .populate("service")
      .populate("provider");

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // -----------------------------------------------
    // OWNERSHIP
    // -----------------------------------------------

    if (bookingData.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own bookings",
      });
    }

    // -----------------------------------------------
    // COMPLETED CHECK
    // -----------------------------------------------

    if (bookingData.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "You can review only completed bookings",
      });
    }

    // -----------------------------------------------
    // DUPLICATE REVIEW CHECK
    // -----------------------------------------------

    const existingReview = await Review.findOne({
      booking: bookingData._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    // -----------------------------------------------
    // CREATE REVIEW
    // -----------------------------------------------

    const review = await Review.create({
      customer: customer._id,
      provider: bookingData.provider,
      service: bookingData.service,
      booking: bookingData._id,
      rating: Number(rating),
      reviewText: reviewText.trim(),
    });

    // -----------------------------------------------
    // RECALCULATE SERVICE RATING
    // -----------------------------------------------

    const serviceReviews = await Review.find({
      service: bookingData.service,
    });

    const totalRating = serviceReviews.reduce(
      (sum, item) => sum + Number(item.rating),
      0,
    );

    const service = await Service.findById(bookingData.service);

    if (service) {
      service.totalReviews = serviceReviews.length;

      service.averageRating =
        serviceReviews.length > 0 ? totalRating / serviceReviews.length : 0;

      service.averageRating = Math.round(service.averageRating * 10) / 10;

      await service.save();
    }

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL REVIEWS
// =====================================================

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: "customer",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("service", "name price location")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET REVIEWS BY SERVICE
// =====================================================

const getReviewsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const reviews = await Review.find({
      service: serviceId,
    })
      .populate({
        path: "customer",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("service", "name price location")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET SERVICE REVIEWS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE REVIEW
// =====================================================

const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: "customer",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("service", "name price location");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE REVIEW
// =====================================================

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const customer = await Customer.findOne({
      user: req.user._id,
    });

    if (!customer || review.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own review",
      });
    }

    // -----------------------------------------------
    // UPDATE RATING
    // -----------------------------------------------

    if (req.body.rating !== undefined) {
      if (req.body.rating < 1 || req.body.rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = Number(req.body.rating);
    }

    // -----------------------------------------------
    // UPDATE REVIEW TEXT
    // -----------------------------------------------

    if (req.body.reviewText !== undefined) {
      review.reviewText = req.body.reviewText.trim();
    }

    await review.save();

    // -----------------------------------------------
    // RECALCULATE RATING
    // -----------------------------------------------

    const reviews = await Review.find({
      service: review.service,
    });

    const totalRating = reviews.reduce(
      (sum, item) => sum + Number(item.rating),
      0,
    );

    const service = await Service.findById(review.service);

    if (service) {
      service.totalReviews = reviews.length;

      service.averageRating =
        reviews.length > 0 ? totalRating / reviews.length : 0;

      service.averageRating = Math.round(service.averageRating * 10) / 10;

      await service.save();
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE REVIEW
// =====================================================

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const customer = await Customer.findOne({
      user: req.user._id,
    });

    if (!customer || review.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review",
      });
    }

    const serviceId = review.service;

    await review.deleteOne();

    // -----------------------------------------------
    // RECALCULATE SERVICE RATING
    // -----------------------------------------------

    const reviews = await Review.find({
      service: serviceId,
    });

    const totalRating = reviews.reduce(
      (sum, item) => sum + Number(item.rating),
      0,
    );

    const service = await Service.findById(serviceId);

    if (service) {
      service.totalReviews = reviews.length;

      service.averageRating =
        reviews.length > 0 ? totalRating / reviews.length : 0;

      service.averageRating = Math.round(service.averageRating * 10) / 10;

      await service.save();
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createReview,
  getReviews,
  getReviewsByService,
  getReviewById,
  updateReview,
  deleteReview,
};
