import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";

const AdminDashboard = () => {
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

      const response = await api.get("/admin/dashboard");

      console.log("ADMIN DASHBOARD RESPONSE:", response.data);

      /*
        Backend returns:

        {
          success: true,
          totalUsers: 8,
          totalCategories: 5,
          totalServices: 5
        }

        This also supports a nested "dashboard" response
        if your backend ever returns that structure.
      */

      const data = response.data?.dashboard || response.data;

      setDashboard(data);
    } catch (error) {
      console.error("Admin dashboard error:", error);

      setError(
        error.response?.data?.message || "Unable to load admin dashboard.",
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
      <div className="admin-dashboard-page">
        <div className="sc-container">
          <div className="admin-dashboard-error">⚠️ {error}</div>
        </div>
      </div>
    );
  }

  // =====================================================
  // COUNTS
  // =====================================================

  const totalUsers = dashboard?.totalUsers ?? 0;

  const totalCategories = dashboard?.totalCategories ?? 0;

  const totalServices = dashboard?.totalServices ?? 0;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-dashboard-page">
      {/* =================================================
          HEADER
      ================================================== */}

      <section className="admin-dashboard-header">
        <div className="sc-container">
          <p className="admin-dashboard-eyebrow">SKILLCONNECT ADMINISTRATION</p>

          <h1>Admin Dashboard</h1>

          <p>Manage SkillConnect users, categories and services.</p>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================== */}

      <main className="admin-dashboard-main">
        <div className="sc-container">
          {/* =================================================
              STATISTICS
          ================================================== */}

          <section className="admin-stats-grid">
            {/* USERS */}

            <div className="admin-stat-card">
              <div className="admin-stat-icon users">👥</div>

              <div className="admin-stat-content">
                <span>Total Users</span>

                <strong>{totalUsers}</strong>

                <p>Registered customers and service providers</p>
              </div>
            </div>

            {/* CATEGORIES */}

            <div className="admin-stat-card">
              <div className="admin-stat-icon categories">📂</div>

              <div className="admin-stat-content">
                <span>Total Categories</span>

                <strong>{totalCategories}</strong>

                <p>Service categories available</p>
              </div>
            </div>

            {/* SERVICES */}

            <div className="admin-stat-card">
              <div className="admin-stat-icon services">🛠️</div>

              <div className="admin-stat-content">
                <span>Total Services</span>

                <strong>{totalServices}</strong>

                <p>Services listed on SkillConnect</p>
              </div>
            </div>
          </section>

          {/* =================================================
              MANAGEMENT
          ================================================== */}

          <section className="admin-management-section">
            <p className="admin-management-eyebrow">ADMINISTRATION</p>

            <h2>Manage SkillConnect</h2>

            <p className="admin-management-subtitle">
              Use the management sections below to maintain the platform.
            </p>

            <div className="admin-management-grid">
              {/* USERS */}

              <Link to="/admin/users" className="admin-management-card users">
                <div className="admin-management-icon">👥</div>

                <h3>Manage Users</h3>

                <p>
                  View and manage registered customers and service providers.
                </p>

                <span>Open Users →</span>
              </Link>

              {/* CATEGORIES */}

              <Link
                to="/admin/categories"
                className="admin-management-card categories"
              >
                <div className="admin-management-icon">📂</div>

                <h3>Manage Categories</h3>

                <p>Create, edit and delete service categories.</p>

                <span>Open Categories →</span>
              </Link>

              {/* SERVICES */}

              <Link
                to="/admin/services"
                className="admin-management-card services"
              >
                <div className="admin-management-icon">🛠️</div>

                <h3>Manage Services</h3>

                <p>View and manage services listed on SkillConnect.</p>

                <span>Open Services →</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
