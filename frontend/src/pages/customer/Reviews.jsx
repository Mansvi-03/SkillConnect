import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";

const Reviews = () => {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // FETCH BOOKING + REVIEWS
  // =====================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const bookingResponse = await api.get(`/bookings/${bookingId}`);

        const bookingData = bookingResponse.data?.booking;

        setBooking(bookingData);

        const serviceId = bookingData?.service?._id || bookingData?.service;

        if (serviceId) {
          const reviewResponse = await api.get(`/reviews/service/${serviceId}`);

          setReviews(reviewResponse.data?.reviews || []);
        }
      } catch (error) {
        console.error("Fetch review information error:", error);

        setError(
          error.response?.data?.message || "Unable to load review information.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter your review.");
      return;
    }

    if (booking?.status !== "Completed") {
      setError("You can submit a review only after the service is completed.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/reviews", {
        bookingId,
        rating,
        comment: comment.trim(),
      });

      setMessage("Your review has been submitted successfully!");

      setComment("");
      setRating(5);
      setHoverRating(0);

      // Reload reviews
      const serviceId = booking?.service?._id || booking?.service;

      if (serviceId) {
        const response = await api.get(`/reviews/service/${serviceId}`);

        setReviews(response.data?.reviews || []);
      }
    } catch (error) {
      console.error("Submit review error:", error);

      setError(error.response?.data?.message || "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "review-status completed";

      case "Accepted":
        return "review-status accepted";

      case "Pending":
        return "review-status pending";

      case "Rejected":
        return "review-status rejected";

      case "Cancelled":
        return "review-status cancelled";

      default:
        return "review-status";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loading />;
  }

  // =====================================================
  // NO BOOKING
  // =====================================================

  if (!booking) {
    return (
      <div className="review-page">
        <div className="sc-container">
          <div className="review-not-found">
            <div className="review-not-found-icon">⭐</div>

            <h2>Booking Not Found</h2>

            <p>We couldn't find the booking associated with this review.</p>

            <Link to="/customer/bookings" className="review-back-button">
              ← Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const serviceName = booking.service?.name || "Service";

  const providerName =
    booking.provider?.user?.name ||
    booking.provider?.name ||
    "Service Provider";

  const providerEmail =
    booking.provider?.user?.email ||
    booking.provider?.email ||
    "Email not available";

  const isCompleted = booking.status === "Completed";

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="review-page">
      {/* =================================================
          HEADER
      ================================================== */}

      <section className="review-header">
        <div className="sc-container">
          <p className="review-eyebrow">CUSTOMER AREA</p>

          <h1>Service Review</h1>

          <p>
            Share your experience with this service and help other customers.
          </p>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================== */}

      <main className="review-main">
        <div className="sc-container">
          {/* BACK */}

          <Link to="/customer/bookings" className="review-back-link">
            ← Back to My Bookings
          </Link>

          {/* =================================================
              ALERTS
          ================================================== */}

          {message && (
            <div className="review-success">
              <span>✓</span>

              <div>
                <strong>Review Submitted</strong>

                <p>{message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="review-error">
              <span>!</span>

              <div>
                <strong>Something went wrong</strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          {/* =================================================
              CONTENT GRID
          ================================================== */}

          <div className="review-layout">
            {/* =================================================
                LEFT SIDE
            ================================================== */}

            <div className="review-left">
              {/* BOOKING CARD */}

              <section className="review-booking-card">
                <div className="review-card-label">YOUR BOOKING</div>

                <div className="review-service-row">
                  <div className="review-service-icon">🛠️</div>

                  <div className="review-service-info">
                    <h2>{serviceName}</h2>

                    <span className={getStatusClass(booking.status)}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="review-booking-details">
                  <div className="review-detail">
                    <span>📅</span>

                    <div>
                      <small>Booking Date</small>

                      <strong>{formatDate(booking.bookingDate)}</strong>
                    </div>
                  </div>

                  <div className="review-detail">
                    <span>🕐</span>

                    <div>
                      <small>Time Slot</small>

                      <strong>
                        {booking.timeSlot?.startTime || "N/A"} -{" "}
                        {booking.timeSlot?.endTime || "N/A"}
                      </strong>
                    </div>
                  </div>

                  <div className="review-detail">
                    <span>💰</span>

                    <div>
                      <small>Amount</small>

                      <strong>₹{booking.amount || 0}</strong>
                    </div>
                  </div>
                </div>
              </section>

              {/* PROVIDER CARD */}

              <section className="review-provider-card">
                <div className="review-card-label">SERVICE PROVIDER</div>

                <div className="review-provider-content">
                  <div className="review-provider-avatar">
                    {providerName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3>{providerName}</h3>

                    <p>{providerEmail}</p>
                  </div>
                </div>
              </section>

              {/* REVIEW FORM */}

              <section className="review-form-card">
                <div className="review-form-header">
                  <div className="review-form-icon">⭐</div>

                  <div>
                    <p className="review-card-label">YOUR EXPERIENCE</p>

                    <h2>Write a Review</h2>

                    <p>Tell us how your experience was with this service.</p>
                  </div>
                </div>

                {!isCompleted ? (
                  <div className="review-disabled">
                    <div className="review-disabled-icon">🔒</div>

                    <h3>Review Not Available Yet</h3>

                    <p>
                      You can submit a review after the service provider marks
                      this booking as completed.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="review-form">
                    {/* RATING */}

                    <div className="review-field">
                      <label>How would you rate this service?</label>

                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            className={
                              value <= (hoverRating || rating)
                                ? "review-star active"
                                : "review-star"
                            }
                            onClick={() => setRating(value)}
                            onMouseEnter={() => setHoverRating(value)}
                            onMouseLeave={() => setHoverRating(0)}
                            aria-label={`Rate ${value} out of 5`}
                          >
                            ★
                          </button>
                        ))}
                      </div>

                      <div className="review-rating-text">
                        {rating === 5 && "Excellent! ⭐"}

                        {rating === 4 && "Very Good! 👍"}

                        {rating === 3 && "Good 🙂"}

                        {rating === 2 && "Could be better 😐"}

                        {rating === 1 && "Needs improvement 😕"}
                      </div>
                    </div>

                    {/* COMMENT */}

                    <div className="review-field">
                      <label htmlFor="review-comment">Your Review</label>

                      <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={6}
                        maxLength={1000}
                        placeholder="Tell us about the quality of service, professionalism, experience and anything else you'd like to share..."
                      />

                      <div className="review-character-count">
                        {comment.length}/1000
                      </div>
                    </div>

                    {/* SUBMIT */}

                    <button
                      type="submit"
                      className="review-submit-button"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="review-spinner" />
                          Submitting Review...
                        </>
                      ) : (
                        <>⭐ Submit Review</>
                      )}
                    </button>
                  </form>
                )}
              </section>
            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================== */}

            <aside className="review-right">
              {/* RATING SUMMARY */}

              <section className="review-summary-card">
                <div className="review-card-label">SERVICE RATING</div>

                <div className="review-summary-rating">
                  <strong>{booking.service?.averageRating || 0}</strong>

                  <div>
                    <div className="review-summary-stars">★★★★★</div>

                    <span>{booking.service?.totalReviews || 0} reviews</span>
                  </div>
                </div>
              </section>

              {/* GUIDELINES */}

              <section className="review-guidelines">
                <div className="review-guidelines-icon">💡</div>

                <h3>Review Guidelines</h3>

                <ul>
                  <li>Be honest about your experience.</li>

                  <li>Keep your review respectful.</li>

                  <li>Mention what you liked or disliked.</li>

                  <li>Avoid sharing private information.</li>
                </ul>
              </section>
            </aside>
          </div>

          {/* =================================================
              EXISTING REVIEWS
          ================================================== */}

          <section className="review-existing-section">
            <div className="review-existing-header">
              <div>
                <p className="review-card-label">CUSTOMER FEEDBACK</p>

                <h2>Customer Reviews</h2>
              </div>

              <span className="review-count">
                {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="review-empty">
                <div className="review-empty-icon">⭐</div>

                <h3>No reviews yet</h3>

                <p>Be the first customer to review this service.</p>
              </div>
            ) : (
              <div className="review-list">
                {reviews.map((review) => {
                  const customerName =
                    review.customer?.user?.name ||
                    review.user?.name ||
                    "Customer";

                  const reviewRating = Number(review.rating) || 0;

                  return (
                    <article key={review._id} className="review-item">
                      <div className="review-item-top">
                        <div className="review-customer">
                          <div className="review-customer-avatar">
                            {customerName.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <h3>{customerName}</h3>

                            <span>Customer</span>
                          </div>
                        </div>

                        <div className="review-item-rating">
                          <span>
                            {"★".repeat(reviewRating)}
                            <span className="review-empty-stars">
                              {"★".repeat(Math.max(0, 5 - reviewRating))}
                            </span>
                          </span>
                        </div>
                      </div>

                      <p className="review-item-comment">{review.comment}</p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Reviews;
