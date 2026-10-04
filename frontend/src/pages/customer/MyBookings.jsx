import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // FETCH BOOKINGS
  // =====================================================

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings");

      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Fetch bookings error:", error);

      setError(
        error.response?.data?.message || "Unable to load your bookings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "booking-status pending";

      case "Accepted":
        return "booking-status accepted";

      case "Completed":
        return "booking-status completed";

      case "Rejected":
        return "booking-status rejected";

      case "Cancelled":
        return "booking-status cancelled";

      default:
        return "booking-status";
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Date not available";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (timeSlot) => {
    if (!timeSlot) {
      return "Time not specified";
    }

    return `${timeSlot.startTime} - ${timeSlot.endTime}`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bookings-page">
      {/* =================================================
          HEADER
      ================================================== */}

      <section className="bookings-page-header">
        <div className="sc-container">
          <p className="bookings-eyebrow">CUSTOMER AREA</p>

          <h1>My Bookings</h1>

          <p>View and track all your service bookings.</p>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================== */}

      <main className="bookings-main">
        <div className="sc-container">
          {/* ERROR */}

          {error && <div className="bookings-error">⚠️ {error}</div>}

          {/* SUMMARY */}

          {!error && bookings.length > 0 && (
            <div className="bookings-summary">
              <div>
                <span className="bookings-summary-label">TOTAL BOOKINGS</span>

                <strong>{bookings.length}</strong>
              </div>

              <Link
                to="/services"
                className="bookings-new-button"
                onClick={(event) => event.stopPropagation()}
              >
                + Book a Service
              </Link>
            </div>
          )}

          {/* BOOKINGS */}

          {bookings.length > 0 ? (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="booking-card booking-card-clickable"
                  onClick={() => navigate(`/customer/bookings/${booking._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      navigate(`/customer/bookings/${booking._id}`);
                    }
                  }}
                >
                  {/* ICON */}

                  <div className="booking-card-icon">🛠️</div>

                  {/* INFORMATION */}

                  <div className="booking-card-content">
                    <div className="booking-card-title-row">
                      <h2>{booking.service?.name || "Service Booking"}</h2>

                      <span className={getStatusClass(booking.status)}>
                        {booking.status || "Pending"}
                      </span>
                    </div>

                    {/* DETAILS */}

                    <div className="booking-details">
                      <div>
                        <span>📅 Date</span>

                        <strong>{formatDate(booking.bookingDate)}</strong>
                      </div>

                      <div>
                        <span>🕐 Time</span>

                        <strong>{formatTime(booking.timeSlot)}</strong>
                      </div>

                      <div>
                        <span>💰 Amount</span>

                        <strong>₹{booking.amount || 0}</strong>
                      </div>
                    </div>

                    {/* PROVIDER */}

                    <div className="booking-provider">
                      <span>Service Provider</span>

                      <strong>
                        {booking.provider?.user?.name ||
                          booking.provider?.name ||
                          "Provider"}
                      </strong>
                    </div>
                  </div>

                  {/* TRACK ACTION */}

                  <div className="booking-card-action">
                    <span className="booking-track-button">
                      Track
                      <span>→</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY */

            <div className="bookings-empty">
              <div className="bookings-empty-icon">📅</div>

              <h2>No bookings yet</h2>

              <p>
                You haven't booked any services yet. Explore local service
                providers and find the right service for you.
              </p>

              <Link to="/services" className="bookings-empty-button">
                Explore Services →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyBookings;
