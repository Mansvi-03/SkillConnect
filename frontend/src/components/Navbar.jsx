import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const role = user?.role;

  return (
    <header className="sc-navbar">
      <div className="sc-container sc-navbar-inner">
        {/* =====================================================
                    LOGO
                ===================================================== */}

        <Link to="/" className="sc-logo">
          <span className="sc-logo-icon">S</span>

          <span>
            Skill
            <span className="sc-logo-blue">Connect</span>
          </span>
        </Link>

        {/* =====================================================
                    NAVIGATION
                ===================================================== */}

        <nav className="sc-nav-links">
          {/* =================================================
                        LOGGED OUT
                    ================================================= */}

          {!isAuthenticated && (
            <>
              <Link to="/" className="sc-nav-link">
                Home
              </Link>

              <Link to="/services" className="sc-nav-link">
                Services
              </Link>

              <Link to="/login" className="sc-nav-link">
                Login
              </Link>

              <Link to="/register" className="sc-nav-button">
                Get Started
              </Link>
            </>
          )}

          {/* =================================================
                        CUSTOMER
                    ================================================= */}

          {isAuthenticated && role === "customer" && (
            <>
              <Link to="/" className="sc-nav-link">
                Home
              </Link>

              <Link to="/services" className="sc-nav-link">
                Services
              </Link>

              <Link to="/customer/dashboard" className="sc-nav-link">
                Dashboard
              </Link>

              <Link to="/customer/bookings" className="sc-nav-link">
                Bookings
              </Link>

              <Link to="/customer/notifications" className="sc-nav-link">
                Notifications
              </Link>
            </>
          )}

          {/* =================================================
                        SERVICE PROVIDER
                    ================================================= */}

          {isAuthenticated && role === "provider" && (
            <>
              <Link to="/provider/dashboard" className="sc-nav-link">
                Dashboard
              </Link>

              <Link to="/provider/services" className="sc-nav-link">
                My Services
              </Link>

              <Link to="/provider/bookings" className="sc-nav-link">
                Bookings
              </Link>
            </>
          )}

          {/* =================================================
                        ADMIN
                    ================================================= */}

          {isAuthenticated && role === "admin" && (
            <>
              <Link to="/admin/dashboard" className="sc-nav-link">
                Dashboard
              </Link>

              <Link to="/admin/users" className="sc-nav-link">
                Users
              </Link>

              <Link to="/admin/categories" className="sc-nav-link">
                Categories
              </Link>

              <Link to="/admin/services" className="sc-nav-link">
                Services
              </Link>
            </>
          )}

          {/* =================================================
                        PROFILE + LOGOUT
                    ================================================= */}

          {isAuthenticated && (
            <>
              <Link to="/profile" className="sc-nav-link">
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="sc-nav-button"
                style={{
                  background: "#ef4444",
                }}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
