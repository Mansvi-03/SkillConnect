import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await register(formData);

      const role = response.user.role;

      if (role === "customer") {
        navigate("/customer/dashboard");
      } else if (role === "provider") {
        navigate("/provider/dashboard");
      }
    } catch (error) {
      console.error("REGISTRATION ERROR:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown registration error";

      setError(message);
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
            <div className="auth-brand-badge">✦ Join SkillConnect</div>

            <h1 className="auth-brand-title">
              Find services.
              <span>Connect. Get things done.</span>
            </h1>

            <p className="auth-brand-description">
              Create your SkillConnect account and discover trusted
              professionals or offer your own services to customers.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <div className="auth-feature-icon">🔍</div>

                <div>
                  <h3>Discover Services</h3>
                  <p>Find the right professional for your needs.</p>
                </div>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">🤝</div>

                <div>
                  <h3>Connect & Communicate</h3>
                  <p>Connect directly with local professionals.</p>
                </div>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">⭐</div>

                <div>
                  <h3>Build Trust</h3>
                  <p>Use ratings and reviews to make better choices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
                    REGISTER FORM SECTION
                ===================================================== */}

        <div className="auth-form-section">
          <div className="auth-form-card auth-register-card">
            {/* Logo */}

            <div className="auth-logo">
              <div className="auth-logo-icon">S</div>

              <span>
                Skill<span>Connect</span>
              </span>
            </div>

            {/* Header */}

            <div className="auth-header">
              <h1>Create your account</h1>

              <p>Join SkillConnect and get started today.</p>
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
              {/* =================================================
                            FULL NAME
                        ================================================= */}

              <div className="auth-field">
                <label htmlFor="register-name">Full Name</label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">👤</span>

                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* =================================================
                            EMAIL
                        ================================================= */}

              <div className="auth-field">
                <label htmlFor="register-email">Email Address</label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">✉</span>

                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* =================================================
                            PHONE
                        ================================================= */}

              <div className="auth-field">
                <label htmlFor="register-phone">Phone Number</label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">📱</span>

                  <input
                    id="register-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              {/* =================================================
                            PASSWORD
                        ================================================= */}

              <div className="auth-field">
                <label htmlFor="register-password">Password</label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>

                  <input
                    id="register-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>

                <p className="auth-field-hint">
                  Password must contain at least 6 characters.
                </p>
              </div>

              {/* =================================================
                            ACCOUNT TYPE
                        ================================================= */}

              <div className="auth-field">
                <label>Account Type</label>

                <div className="auth-role-grid">
                  {/* Customer */}

                  <label
                    className={`auth-role-option ${
                      formData.role === "customer"
                        ? "auth-role-option-active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={formData.role === "customer"}
                      onChange={handleChange}
                    />

                    <div className="auth-role-icon">👤</div>

                    <div className="auth-role-content">
                      <span className="auth-role-title">Customer</span>

                      <span className="auth-role-description">
                        Find & book services
                      </span>
                    </div>

                    <div className="auth-role-check">✓</div>
                  </label>

                  {/* Service Provider */}

                  <label
                    className={`auth-role-option ${
                      formData.role === "provider"
                        ? "auth-role-option-active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="provider"
                      checked={formData.role === "provider"}
                      onChange={handleChange}
                    />

                    <div className="auth-role-icon">🛠️</div>

                    <div className="auth-role-content">
                      <span className="auth-role-title">Service Provider</span>

                      <span className="auth-role-description">
                        Offer your services
                      </span>
                    </div>

                    <div className="auth-role-check">✓</div>
                  </label>
                </div>
              </div>

              {/* =================================================
                            REGISTER BUTTON
                        ================================================= */}

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-button"
              >
                {loading ? (
                  <>
                    <span className="auth-button-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* =================================================
                        LOGIN LINK
                    ================================================= */}

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <p className="auth-bottom-text">
              Already have an account?
              <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
