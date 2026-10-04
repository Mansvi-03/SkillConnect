import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";

const CustomerDashboard = () => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings/");

      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Dashboard booking error:", error);

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

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  const totalSpent = bookings
    .filter((booking) => booking.status === "completed")
    .reduce(
      (total, booking) =>
        total +
        Number(booking.totalAmount || booking.amount || booking.price || 0),
      0,
    );

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "dashboard-status pending";

      case "accepted":
        return "dashboard-status accepted";

      case "completed":
        return "dashboard-status completed";

      case "rejected":
        return "dashboard-status rejected";

      case "cancelled":
        return "dashboard-status cancelled";

      default:
        return "dashboard-status";
    }
  };

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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="customer-dashboard">
      {/* =====================================================
                HEADER
            ===================================================== */}

      <section className="customer-dashboard-header">
        <div className="sc-container">
          <div className="dashboard-welcome">
            <div>
              <p className="dashboard-eyebrow">CUSTOMER DASHBOARD</p>

              <h1>
                Welcome back,
                <span> {user?.name || "Customer"}</span>
              </h1>

              <p className="dashboard-subtitle">
                Manage your services, bookings and conversations from one place.
              </p>
            </div>

            <Link to="/services" className="dashboard-primary-button">
              + Find a Service
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
                MAIN
            ===================================================== */}

      <main className="customer-dashboard-main">
        <div className="sc-container">
          {error && <div className="dashboard-error">⚠️ {error}</div>}

          {/* =================================================
                        STATISTICS
                    ================================================= */}

          <section className="dashboard-stats">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon blue">📅</div>

              <div>
                <p className="dashboard-stat-label">Total Bookings</p>

                <h2>{totalBookings}</h2>

                <span>All your bookings</span>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon amber">⏳</div>

              <div>
                <p className="dashboard-stat-label">Pending</p>

                <h2>{pendingBookings}</h2>

                <span>Awaiting response</span>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon green">✓</div>

              <div>
                <p className="dashboard-stat-label">Completed</p>

                <h2>{completedBookings}</h2>

                <span>Successfully completed</span>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon purple">₹</div>

              <div>
                <p className="dashboard-stat-label">Total Spent</p>

                <h2>₹{totalSpent}</h2>

                <span>Completed services</span>
              </div>
            </div>
          </section>

          {/* =================================================
                        QUICK ACTIONS
                    ================================================= */}

          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-section-label">QUICK ACTIONS</p>

                <h2>What would you like to do?</h2>
              </div>
            </div>

            <div className="dashboard-actions-grid">
              <Link
                to="/services"
                className="dashboard-action-card blue-action"
              >
                <div className="action-icon">🔍</div>

                <div>
                  <h3>Browse Services</h3>

                  <p>Discover skilled local professionals.</p>
                </div>

                <span className="action-arrow">→</span>
              </Link>

              <Link
                to="/customer/bookings"
                className="dashboard-action-card purple-action"
              >
                <div className="action-icon">📅</div>

                <div>
                  <h3>My Bookings</h3>

                  <p>View and manage your bookings.</p>
                </div>

                <span className="action-arrow">→</span>
              </Link>

              <Link
                to="/customer/notifications"
                className="dashboard-action-card green-action"
              >
                <div className="action-icon">🔔</div>

                <div>
                  <h3>Notifications</h3>

                  <p>Check your latest updates.</p>
                </div>

                <span className="action-arrow">→</span>
              </Link>

              <Link
                to="/profile"
                className="dashboard-action-card orange-action"
              >
                <div className="action-icon">👤</div>

                <div>
                  <h3>My Profile</h3>

                  <p>Update your personal information.</p>
                </div>

                <span className="action-arrow">→</span>
              </Link>
            </div>
          </section>

          {/* =================================================
                        RECENT BOOKINGS
                    ================================================= */}

          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-section-label">RECENT ACTIVITY</p>

                <h2>Recent Bookings</h2>
              </div>

              <Link to="/customer/bookings" className="view-all-link">
                View all →
              </Link>
            </div>

            {recentBookings.length > 0 ? (
              <div className="recent-bookings-card">
                {recentBookings.map((booking) => (
                  <div key={booking._id} className="recent-booking">
                    <div className="booking-service-icon">🛠️</div>

                    <div className="booking-info">
                      <h3>
                        {booking.service?.name ||
                          booking.serviceName ||
                          "Service Booking"}
                      </h3>

                      <p>
                        {formatDate(booking.date)}

                        {booking.timeSlot && ` • ${booking.timeSlot}`}
                      </p>
                    </div>

                    <div className="booking-price">
                      <strong>
                        ₹
                        {booking.totalAmount ||
                          booking.amount ||
                          booking.price ||
                          0}
                      </strong>
                    </div>

                    <span className={getStatusClass(booking.status)}>
                      {booking.status || "pending"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">📅</div>

                <h3>No bookings yet</h3>

                <p>
                  You haven't booked a service yet. Explore local professionals
                  and find something you need.
                </p>

                <Link to="/services" className="empty-dashboard-button">
                  Explore Services →
                </Link>
              </div>
            )}
          </section>

          {/* =================================================
                        CTA
                    ================================================= */}

          <section className="dashboard-bottom-cta">
            <div>
              <span>✦</span>

              <div>
                <h2>Looking for something specific?</h2>

                <p>Search local services and find the right professional.</p>
              </div>
            </div>

            <Link to="/services" className="dashboard-cta-button">
              Explore Services →
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
