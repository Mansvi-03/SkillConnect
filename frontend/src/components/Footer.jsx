import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="sc-footer">
      <div className="sc-container">
        <div className="footer-inner">
          {/* Brand */}

          <div>
            <div className="footer-logo">
              Skill<span className="sc-logo-blue">Connect</span>
            </div>

            <p className="footer-description">
              A local marketplace connecting customers with skilled service
              providers for everyday needs.
            </p>
          </div>

          {/* Links */}

          <div>
            <h3 className="footer-heading">Quick Links</h3>

            <div className="footer-links">
              <Link to="/">Home</Link>

              <Link to="/services">Services</Link>

              <Link to="/login">Login</Link>

              <Link to="/register">Register</Link>
            </div>
          </div>

          {/* Contact */}

          <div>
            <h3 className="footer-heading">Contact</h3>

            <div className="footer-contact">
              <span>📧 support@skillconnect.com</span>

              <span>📞 +91 98765 43210</span>

              <span>📍 Gujarat, India</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 SkillConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
