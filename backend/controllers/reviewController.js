const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Service = require("../models/Service");

// CREATE REVIEW
const createReview = async (req, res) => {
  try {
    const { booking, rating, reviewText } = req.body;

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

    const customer = await Customer.findOne({
      user: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const bookingData = await Booking.findById(booking);

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (bookingData.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own bookings",
      });
    }

    if (bookingData.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "You can review only completed bookings",
      });
    }

    const existingReview = await Review.findOne({
      booking: bookingData._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    const review = await Review.create({
      customer: customer._id,
      provider: bookingData.provider,
      service: bookingData.service,
      booking: bookingData._id,
      rating,
      reviewText,
    });

    // Update service rating
    const service = await Service.findById(bookingData.service);

    if (service) {
      const totalRating = service.averageRating * service.totalReviews;

      service.totalReviews += 1;

      service.averageRating =
        (totalRating + Number(rating)) / service.totalReviews;

      service.averageRating = Math.round(service.averageRating * 10) / 10;

      await service.save();
    }

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL REVIEWS
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer")
      .populate("provider")
      .populate("service")
      .sort({ _id: -1 });

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

// GET SINGLE REVIEW
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("customer")
      .populate("provider")
      .populate("service");

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

// UPDATE REVIEW
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

    const oldRating = review.rating;

    if (req.body.rating !== undefined) {
      if (req.body.rating < 1 || req.body.rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = req.body.rating;
    }

    if (req.body.reviewText !== undefined) {
      review.reviewText = req.body.reviewText;
    }

    await review.save();

    // Recalculate service rating
    if (oldRating !== review.rating) {
      const reviews = await Review.find({
        service: review.service,
      });

      const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);

      const service = await Service.findById(review.service);

      if (service) {
        service.totalReviews = reviews.length;

        service.averageRating =
          reviews.length > 0 ? totalRating / reviews.length : 0;

        service.averageRating = Math.round(service.averageRating * 10) / 10;

        await service.save();
      }
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

// DELETE REVIEW
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

    // Recalculate service rating
    const reviews = await Review.find({
      service: serviceId,
    });

    const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);

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

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
