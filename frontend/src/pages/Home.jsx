import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* =====================================================
                HERO
            ===================================================== */}

      <section className="home-hero">
        <div className="sc-container hero-inner">
          <div className="hero-content">
            <span className="hero-badge">
              ✦ Local services. Trusted professionals.
            </span>

            <h1 className="hero-title">
              Find the right
              <span className="hero-title-highlight">service for you.</span>
            </h1>

            <p className="hero-description">
              SkillConnect helps you discover trusted local service providers,
              compare services, book appointments and communicate with
              professionals — all in one place.
            </p>

            <div className="hero-actions">
              <Link to="/services" className="hero-primary-button">
                Explore Services →
              </Link>

              {!isAuthenticated && (
                <Link to="/register" className="hero-secondary-button">
                  Join SkillConnect
                </Link>
              )}
            </div>
          </div>

          {/* =====================================================
                    HERO VISUAL
                ===================================================== */}

          <div className="hero-visual">
            <div className="hero-dashboard-card">
              <div className="hero-card-header">
                <span className="hero-card-title">Popular Services</span>

                <span className="hero-card-status">● Available</span>
              </div>

              <div className="hero-service">
                <div className="hero-service-icon">🔧</div>

                <div className="hero-service-info">
                  <div className="hero-service-name">Home Repair</div>

                  <div className="hero-service-meta">
                    ⭐ 4.8 · Local Provider
                  </div>
                </div>

                <div className="hero-service-price">₹500</div>
              </div>

              <div className="hero-service">
                <div className="hero-service-icon">💻</div>

                <div className="hero-service-info">
                  <div className="hero-service-name">Computer Repair</div>

                  <div className="hero-service-meta">
                    ⭐ 4.9 · Local Provider
                  </div>
                </div>

                <div className="hero-service-price">₹700</div>
              </div>

              <div className="hero-service">
                <div className="hero-service-icon">🧹</div>

                <div className="hero-service-info">
                  <div className="hero-service-name">Home Cleaning</div>

                  <div className="hero-service-meta">
                    ⭐ 4.7 · Local Provider
                  </div>
                </div>

                <div className="hero-service-price">₹400</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
                TRUST BAR
            ===================================================== */}

      <section className="trust-section">
        <div className="sc-container trust-inner">
          <div className="trust-item">
            <span className="trust-icon">✓</span>
            Trusted local professionals
          </div>

          <div className="trust-item">
            <span className="trust-icon">⚡</span>
            Easy booking process
          </div>

          <div className="trust-item">
            <span className="trust-icon">💬</span>
            Direct communication
          </div>

          <div className="trust-item">
            <span className="trust-icon">⭐</span>
            Ratings & reviews
          </div>
        </div>
      </section>

      {/* =====================================================
                FEATURES
            ===================================================== */}

      <section className="features-section">
        <div className="sc-container">
          <div className="section-header">
            <p className="section-label">Why SkillConnect</p>

            <h2 className="section-title">
              Everything you need to find a local service
            </h2>

            <p className="section-description">
              Discover professionals, compare services, communicate directly and
              manage your bookings from one simple platform.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}

            <div className="feature-card">
              <div className="feature-icon">🔍</div>

              <h3 className="feature-title">Find Services Easily</h3>

              <p className="feature-text">
                Search and filter local services by category, location, price
                and customer ratings.
              </p>
            </div>

            {/* Feature 2 */}

            <div className="feature-card">
              <div className="feature-icon">🤝</div>

              <h3 className="feature-title">Connect With Providers</h3>

              <p className="feature-text">
                Discover skilled service providers and communicate directly
                before booking.
              </p>
            </div>

            {/* Feature 3 */}

            <div className="feature-card">
              <div className="feature-icon">💬</div>

              <h3 className="feature-title">Manage Everything</h3>

              <p className="feature-text">
                Manage bookings, payments, notifications, reviews and
                conversations in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
                CTA
            ===================================================== */}

      <section className="home-cta">
        <div className="sc-container">
          <div className="cta-box">
            <div className="cta-content">
              <h2 className="cta-title">Ready to find your next service?</h2>

              <p className="cta-description">
                Explore local professionals and find the service that matches
                your needs.
              </p>

              <Link to="/services" className="cta-button">
                Explore Services →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
