import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);

      const role = response.user.role;

      if (role === "customer") {
        navigate("/customer/dashboard");
      } else if (role === "provider") {
        navigate("/provider/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* =====================================================
                    LEFT BRAND SECTION
                ===================================================== */}

        <div className="auth-brand-section">
          <div className="auth-brand-content">
            <div className="auth-brand-badge">✦ Welcome to SkillConnect</div>

            <h1 className="auth-brand-title">
              Connect with
              <span> trusted local professionals.</span>
            </h1>

            <p className="auth-brand-description">
              Discover services, connect with skilled professionals, manage
              bookings and get everything done in one place.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <div className="auth-feature-icon">🔍</div>

                <div>
                  <h3>Find Local Services</h3>
                  <p>Discover professionals near you.</p>
                </div>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">🤝</div>

                <div>
                  <h3>Connect Directly</h3>
                  <p>Communicate with service providers.</p>
                </div>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">⭐</div>

                <div>
                  <h3>Trusted Professionals</h3>
                  <p>Compare ratings and reviews.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
                    LOGIN CARD
                ===================================================== */}

        <div className="auth-form-section">
          <div className="auth-form-card">
            {/* Logo */}

            <div className="auth-logo">
              <div className="auth-logo-icon">S</div>

              <span>
                Skill<span>Connect</span>
              </span>
            </div>

            {/* Heading */}

            <div className="auth-header">
              <h1>Welcome back</h1>

              <p>Login to continue to your SkillConnect account.</p>
            </div>

            {/* Error */}

            {error && (
              <div className="auth-error">
                <span>⚠</span>
                <p>{error}</p>
              </div>
            )}

            {/* Form */}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email */}

              <div className="auth-field">
                <label htmlFor="login-email">Email Address</label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">✉</span>

                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}

              <div className="auth-field">
                <label htmlFor="login-password">Password</label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>

                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {/* Forgot Password */}

              <div className="auth-forgot-row">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-button"
              >
                {loading ? (
                  <>
                    <span className="auth-button-spinner"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    Login to SkillConnect
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* Register */}

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <p className="auth-bottom-text">
              Don't have an account?
              <Link to="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
