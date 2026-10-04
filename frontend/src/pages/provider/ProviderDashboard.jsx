import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";

const ProviderDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/provider/dashboard");

      console.log("PROVIDER DASHBOARD RESPONSE:", response.data);

      // Backend returns:
      //
      // {
      //   success: true,
      //   dashboard: {
      //     totalServices: 1,
      //     totalBookings: 1,
      //     completedBookings: 0,
      //     totalEarnings: 0
      //   }
      // }

      setDashboard(response.data?.dashboard || {});
    } catch (error) {
      console.error("Provider dashboard error:", error);

      setError(
        error.response?.data?.message || "Unable to load provider dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loading />;
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="provider-dashboard-page">
        <div className="sc-container">
          <div className="provider-dashboard-error">
            <div className="provider-dashboard-error-icon">⚠️</div>

            <h2>Unable to Load Dashboard</h2>

            <p>{error}</p>

            <button
              type="button"
              className="provider-dashboard-retry"
              onClick={fetchDashboard}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // VALUES
  // =====================================================

  const totalServices = dashboard?.totalServices ?? 0;

  const totalBookings = dashboard?.totalBookings ?? 0;

  const completedBookings = dashboard?.completedBookings ?? 0;

  const totalEarnings = dashboard?.totalEarnings ?? 0;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="provider-dashboard-page">
      <div className="sc-container">
        {/* =================================================
            PAGE HEADER
        ================================================== */}

        <div className="provider-dashboard-header">
          <div>
            <p className="provider-dashboard-eyebrow">PROVIDER WORKSPACE</p>

            <h1 className="provider-dashboard-title">Provider Dashboard</h1>

            <p className="provider-dashboard-subtitle">
              Manage your services, bookings and earnings from one place.
            </p>
          </div>
        </div>

        {/* =================================================
            STATISTICS
        ================================================== */}

        <div className="provider-stats-grid">
          {/* TOTAL SERVICES */}

          <div className="provider-stat-card">
            <div className="provider-stat-top">
              <div className="provider-stat-icon service-icon">🛠️</div>

              <span className="provider-stat-label">Total Services</span>
            </div>

            <div className="provider-stat-value">{totalServices}</div>

            <p className="provider-stat-description">
              Services you currently offer
            </p>
          </div>

          {/* TOTAL BOOKINGS */}

          <div className="provider-stat-card">
            <div className="provider-stat-top">
              <div className="provider-stat-icon booking-icon">📅</div>

              <span className="provider-stat-label">Total Bookings</span>
            </div>

            <div className="provider-stat-value">{totalBookings}</div>

            <p className="provider-stat-description">
              Customer bookings received
            </p>
          </div>

          {/* COMPLETED */}

          <div className="provider-stat-card">
            <div className="provider-stat-top">
              <div className="provider-stat-icon completed-icon">✓</div>

              <span className="provider-stat-label">Completed</span>
            </div>

            <div className="provider-stat-value">{completedBookings}</div>

            <p className="provider-stat-description">
              Successfully completed bookings
            </p>
          </div>

          {/* EARNINGS */}

          <div className="provider-stat-card">
            <div className="provider-stat-top">
              <div className="provider-stat-icon earnings-icon">₹</div>

              <span className="provider-stat-label">Earnings</span>
            </div>

            <div className="provider-stat-value">₹{totalEarnings}</div>

            <p className="provider-stat-description">
              Total earnings from successful payments
            </p>
          </div>
        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="provider-actions-section">
          <div className="provider-section-header">
            <div>
              <p className="provider-section-eyebrow">QUICK ACTIONS</p>

              <h2 className="provider-section-title">Manage your work</h2>
            </div>

            <p className="provider-section-description">
              Quickly access your main provider activities.
            </p>
          </div>

          <div className="provider-actions-grid">
            {/* MY SERVICES */}

            <Link to="/provider/services" className="provider-action-card">
              <div className="provider-action-icon">🛠️</div>

              <div className="provider-action-content">
                <h3>My Services</h3>

                <p>Add, update and manage the services you offer.</p>
              </div>

              <span className="provider-action-arrow">→</span>
            </Link>

            {/* BOOKINGS */}

            <Link to="/provider/bookings" className="provider-action-card">
              <div className="provider-action-icon">📅</div>

              <div className="provider-action-content">
                <h3>Bookings</h3>

                <p>View and manage your customer bookings.</p>
              </div>

              <span className="provider-action-arrow">→</span>
            </Link>

            {/* EARNINGS */}

            <Link to="/provider/earnings" className="provider-action-card">
              <div className="provider-action-icon">₹</div>

              <div className="provider-action-content">
                <h3>Earnings</h3>

                <p>View your earnings and payment information.</p>
              </div>

              <span className="provider-action-arrow">→</span>
            </Link>
          </div>
        </div>

        {/* =================================================
            BOTTOM INFORMATION
        ================================================== */}

        <div className="provider-dashboard-tip">
          <div className="provider-tip-icon">💡</div>

          <div>
            <h3>Keep your services updated</h3>

            <p>
              Make sure your service information, pricing and availability are
              up to date so customers can easily find and book your services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
