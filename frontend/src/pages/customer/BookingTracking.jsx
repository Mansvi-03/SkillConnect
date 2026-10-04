import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../../services/api";
import Loading from "../../components/Loading";

const BookingTracking = () => {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     FETCH BOOKING
  ===================================================== */

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        if (!bookingId) {
          setError("Booking ID is missing.");
          return;
        }

        const response = await api.get(`/bookings/${bookingId}`);

        setBooking(response.data.booking);
      } catch (error) {
        console.error("Fetch booking error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load booking information.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return <Loading />;
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="booking-tracking-page">
        <div className="sc-container">
          <div className="booking-tracking-error">
            <div className="booking-tracking-error-icon">!</div>

            <h2>Unable to Load Booking</h2>

            <p>{error}</p>

            <Link
              to="/customer/bookings"
              className="booking-tracking-back-button"
            >
              ← Back to My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     BOOKING NOT FOUND
  ===================================================== */

  if (!booking) {
    return (
      <div className="booking-tracking-page">
        <div className="sc-container">
          <div className="booking-tracking-error">
            <div className="booking-tracking-error-icon">!</div>

            <h2>Booking Not Found</h2>

            <p>We could not find this booking.</p>

            <Link
              to="/customer/bookings"
              className="booking-tracking-back-button"
            >
              ← Back to My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     DATA
  ===================================================== */

  const status = booking.status || "Pending";

  const serviceName = booking.service?.name || booking.serviceName || "Service";

  const providerName =
    booking.provider?.user?.name ||
    booking.provider?.name ||
    "Service Provider";

  const providerEmail =
    booking.provider?.user?.email ||
    booking.provider?.email ||
    "Email not available";

  const bookingDate = booking.bookingDate || booking.date;

  const startTime = booking.timeSlot?.startTime || "";

  const endTime = booking.timeSlot?.endTime || "";

  const amount = booking.amount || booking.totalAmount || 0;

  /* =====================================================
     STATUS
  ===================================================== */

  const normalizedStatus = status.toLowerCase();

  const isPending = normalizedStatus === "pending";

  const isAccepted = normalizedStatus === "accepted";

  const isCompleted = normalizedStatus === "completed";

  const isRejected = normalizedStatus === "rejected";

  const isCancelled = normalizedStatus === "cancelled";

  /* =====================================================
     STATUS MESSAGE
  ===================================================== */

  const getStatusMessage = () => {
    if (isPending) {
      return "Your booking has been submitted to the service provider.";
    }

    if (isAccepted) {
      return "The service provider has accepted your booking.";
    }

    if (isCompleted) {
      return "Your service has been completed.";
    }

    if (isRejected) {
      return "The service provider has rejected this booking.";
    }

    if (isCancelled) {
      return "This booking has been cancelled.";
    }

    return "Your booking is being processed.";
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

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

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="booking-tracking-page">
      <div className="sc-container">
        <div className="booking-tracking-layout">
          {/* =================================================
              MAIN
          ================================================= */}

          <main className="booking-tracking-main">
            {/* SERVICE */}

            <div className="booking-tracking-service-card">
              <div className="booking-tracking-service-icon">🛠️</div>

              <div className="booking-tracking-service-info">
                <span className="booking-tracking-eyebrow">SERVICE</span>

                <h1>{serviceName}</h1>

                <span
                  className={`booking-tracking-status booking-status-${normalizedStatus}`}
                >
                  {status}
                </span>
              </div>
            </div>

            {/* =================================================
                PROGRESS
            ================================================= */}

            <div className="booking-tracking-progress-card">
              <div className="booking-tracking-section-header">
                <span>BOOKING PROGRESS</span>

                <h2>Service Status</h2>
              </div>

              <div className="booking-progress">
                {/* STEP 1 */}

                <div
                  className={`booking-progress-step ${
                    isPending || isAccepted || isCompleted ? "active" : ""
                  }`}
                >
                  <div className="booking-progress-circle">
                    {isRejected || isCancelled ? "!" : "✓"}
                  </div>

                  <div className="booking-progress-content">
                    <span>STEP 1</span>

                    <h3>Booking Pending</h3>

                    <p>
                      Your booking has been submitted to the service provider.
                    </p>
                  </div>
                </div>

                {/* STEP 2 */}

                <div
                  className={`booking-progress-step ${
                    isAccepted || isCompleted ? "active" : ""
                  }`}
                >
                  <div className="booking-progress-circle">
                    {isAccepted || isCompleted ? "✓" : "2"}
                  </div>

                  <div className="booking-progress-content">
                    <span>STEP 2</span>

                    <h3>Provider Accepted</h3>

                    <p>
                      {isAccepted || isCompleted
                        ? "The service provider has accepted your booking."
                        : "Waiting for the service provider to accept your booking."}
                    </p>
                  </div>
                </div>

                {/* STEP 3 */}

                <div
                  className={`booking-progress-step ${
                    isCompleted ? "active" : ""
                  }`}
                >
                  <div className="booking-progress-circle">
                    {isCompleted ? "✓" : "3"}
                  </div>

                  <div className="booking-progress-content">
                    <span>STEP 3</span>

                    <h3>Service Completed</h3>

                    <p>
                      {isCompleted
                        ? "Your service has been completed."
                        : "The service will be marked completed after the provider finishes it."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                BOOKING DETAILS
            ================================================= */}

            <div className="booking-tracking-details-card">
              <div className="booking-tracking-section-header">
                <span>BOOKING INFORMATION</span>

                <h2>Booking Details</h2>
              </div>

              <div className="booking-tracking-details-grid">
                <div className="booking-tracking-detail">
                  <span>📅 Booking Date</span>

                  <strong>{formatDate(bookingDate)}</strong>
                </div>

                <div className="booking-tracking-detail">
                  <span>🕐 Time Slot</span>

                  <strong>
                    {startTime && endTime
                      ? `${startTime} - ${endTime}`
                      : "Not specified"}
                  </strong>
                </div>

                <div className="booking-tracking-detail">
                  <span>💰 Amount</span>

                  <strong>₹{amount}</strong>
                </div>

                <div className="booking-tracking-detail">
                  <span>📌 Current Status</span>

                  <strong>{status}</strong>
                </div>
              </div>
            </div>
          </main>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="booking-tracking-sidebar">
            {/* PROVIDER */}

            <div className="booking-tracking-provider-card">
              <span className="booking-tracking-eyebrow">SERVICE PROVIDER</span>

              <div className="booking-provider-profile">
                <div className="booking-provider-avatar">
                  {providerName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3>{providerName}</h3>

                  <p>{providerEmail}</p>
                </div>
              </div>
            </div>

            {/* STATUS */}

            <div className="booking-tracking-current-card">
              <span className="booking-tracking-eyebrow">CURRENT STATUS</span>

              <div
                className={`booking-current-status booking-current-${normalizedStatus}`}
              >
                {status}
              </div>

              <p>{getStatusMessage()}</p>
            </div>

            {/* =================================================
                CHAT
            ================================================= */}

            {(isAccepted || isCompleted) && (
              <Link
                to={`/customer/chat/${booking._id}`}
                className="booking-tracking-action booking-chat-action"
              >
                <span>💬 Chat with Provider</span>

                <span>→</span>
              </Link>
            )}

            {/* =================================================
                REVIEW
            ================================================= */}

            {isCompleted && (
              <Link
                to={`/customer/reviews/${booking._id}`}
                className="booking-tracking-action booking-review-action"
              >
                <span>⭐ Give Review</span>

                <span>→</span>
              </Link>
            )}

            {/* =================================================
                SERVICE
            ================================================= */}

            {booking.service?._id && (
              <Link
                to={`/services/${booking.service._id}`}
                className="booking-tracking-action booking-service-action"
              >
                <span>View Service</span>

                <span>→</span>
              </Link>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BookingTracking;
