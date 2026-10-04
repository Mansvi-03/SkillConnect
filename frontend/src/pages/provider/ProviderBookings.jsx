import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

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
      console.error("Fetch provider bookings error:", error);

      setError(error.response?.data?.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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

    if (typeof timeSlot === "string") {
      return timeSlot;
    }

    if (timeSlot.startTime && timeSlot.endTime) {
      return `${timeSlot.startTime} - ${timeSlot.endTime}`;
    }

    return "Time not specified";
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "provider-booking-status pending";

      case "Accepted":
        return "provider-booking-status accepted";

      case "Completed":
        return "provider-booking-status completed";

      case "Rejected":
        return "provider-booking-status rejected";

      case "Cancelled":
        return "provider-booking-status cancelled";

      default:
        return "provider-booking-status";
    }
  };

  // =====================================================
  // BOOKING ACTION
  // =====================================================

  const handleAction = async (bookingId, action) => {
    try {
      setActionLoading(`${bookingId}-${action}`);
      setError("");

      await api.put(`/bookings/${bookingId}/${action}`);

      await fetchBookings();
    } catch (error) {
      console.error(`${action} booking error:`, error);

      setError(error.response?.data?.message || `Unable to ${action} booking.`);
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loading />;
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="provider-bookings-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="provider-bookings-header">
        <div className="sc-container">
          <p className="provider-bookings-eyebrow">PROVIDER AREA</p>

          <h1>Customer Bookings</h1>

          <p>View and manage service bookings from your customers.</p>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="provider-bookings-main">
        <div className="sc-container">
          {/* ERROR */}

          {error && <div className="provider-bookings-error">⚠️ {error}</div>}

          {/* SUMMARY */}

          <div className="provider-bookings-summary">
            <div>
              <span>TOTAL BOOKINGS</span>

              <strong>{bookings.length}</strong>
            </div>
          </div>

          {/* =================================================
              NO BOOKINGS
          ================================================= */}

          {bookings.length === 0 ? (
            <div className="provider-bookings-empty">
              <div className="provider-bookings-empty-icon">📅</div>

              <h2>No bookings yet</h2>

              <p>
                You don't have any customer bookings yet. New bookings will
                appear here.
              </p>
            </div>
          ) : (
            /* =================================================
               BOOKINGS
            ================================================= */

            <div className="provider-bookings-list">
              {bookings.map((booking) => {
                const customerName =
                  booking.customer?.user?.name ||
                  booking.customer?.name ||
                  "Customer";

                const customerEmail =
                  booking.customer?.user?.email ||
                  booking.customer?.email ||
                  "Email not available";

                const customerPhone =
                  booking.customer?.user?.phone ||
                  booking.customer?.phone ||
                  "Phone not available";

                const serviceName = booking.service?.name || "Service";

                const amount = booking.amount || 0;

                /*
                 * Customer User ID
                 *
                 * Booking customer is a Customer document.
                 * Customer.user contains the actual User ID.
                 */
                const customerUserId =
                  booking.customer?.user?._id || booking.customer?.user;

                return (
                  <article key={booking._id} className="provider-booking-card">
                    {/* =================================================
                        CARD TOP
                    ================================================= */}

                    <div className="provider-booking-top">
                      <div className="provider-booking-service">
                        <div className="provider-booking-service-icon">🛠️</div>

                        <div>
                          <span className="provider-booking-label">
                            SERVICE
                          </span>

                          <h2>{serviceName}</h2>
                        </div>
                      </div>

                      <span className={getStatusClass(booking.status)}>
                        {booking.status || "Pending"}
                      </span>
                    </div>

                    {/* =================================================
                        BODY
                    ================================================= */}

                    <div className="provider-booking-body">
                      {/* CUSTOMER */}

                      <div className="provider-booking-section">
                        <span className="provider-booking-label">CUSTOMER</span>

                        <div className="provider-customer-info">
                          <div className="provider-customer-avatar">
                            {customerName.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{customerName}</strong>

                            <p>{customerEmail}</p>

                            <p>{customerPhone}</p>
                          </div>
                        </div>
                      </div>

                      {/* BOOKING DETAILS */}

                      <div className="provider-booking-details">
                        {/* DATE */}

                        <div className="provider-detail-item">
                          <span>📅</span>

                          <div>
                            <small>Booking Date</small>

                            <strong>{formatDate(booking.bookingDate)}</strong>
                          </div>
                        </div>

                        {/* TIME */}

                        <div className="provider-detail-item">
                          <span>🕐</span>

                          <div>
                            <small>Time Slot</small>

                            <strong>{formatTime(booking.timeSlot)}</strong>
                          </div>
                        </div>

                        {/* AMOUNT */}

                        <div className="provider-detail-item">
                          <span>💰</span>

                          <div>
                            <small>Amount</small>

                            <strong>₹{amount}</strong>
                          </div>
                        </div>

                        {/* PAYMENT */}

                        <div className="provider-detail-item">
                          <span>💳</span>

                          <div>
                            <small>Payment</small>

                            <strong>
                              {booking.paymentStatus || "Pending"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="provider-booking-footer">
                      <div className="provider-booking-actions">
                        {/* =================================================
                            ACCEPT
                        ================================================= */}

                        {booking.status === "Pending" && (
                          <button
                            type="button"
                            className="provider-action-button accept"
                            onClick={() => handleAction(booking._id, "accept")}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === `${booking._id}-accept`
                              ? "Accepting..."
                              : "✓ Accept"}
                          </button>
                        )}

                        {/* =================================================
                            REJECT
                        ================================================= */}

                        {booking.status === "Pending" && (
                          <button
                            type="button"
                            className="provider-action-button reject"
                            onClick={() => handleAction(booking._id, "reject")}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === `${booking._id}-reject`
                              ? "Rejecting..."
                              : "✕ Reject"}
                          </button>
                        )}

                        {/* =================================================
                            CHAT
                            SHOW AFTER ACCEPTED
                        ================================================= */}

                        {booking.status === "Accepted" && customerUserId && (
                          <Link
                            to={`/provider/chat/${customerUserId}`}
                            state={{
                              bookingId: booking._id,
                              serviceId:
                                booking.service?._id || booking.service,
                              serviceName,
                              bookingDate: booking.bookingDate,
                              timeSlot: booking.timeSlot,
                            }}
                            className="provider-action-button chat"
                          >
                            💬 Chat with Customer
                          </Link>
                        )}

                        {/* =================================================
                            COMPLETE
                        ================================================= */}

                        {booking.status === "Accepted" && (
                          <button
                            type="button"
                            className="provider-action-button complete"
                            onClick={() =>
                              handleAction(booking._id, "complete")
                            }
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === `${booking._id}-complete`
                              ? "Completing..."
                              : "✓ Mark Completed"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProviderBookings;
