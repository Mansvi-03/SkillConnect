import { Link } from "react-router-dom";

const ServiceCard = ({ service }) => {
  const image =
    service?.images?.length > 0
      ? `http://localhost:5000${service.images[0]}`
      : null;

  const providerName =
    service?.provider?.user?.name || "Local Service Provider";

  const rating = Number(service?.averageRating || 0).toFixed(1);

  return (
    <article className="service-card">
      {/* =====================================================
                IMAGE
            ===================================================== */}

      <div className="service-image-wrapper">
        {image ? (
          <img
            src={image}
            alt={service?.name || "Service"}
            className="service-image"
          />
        ) : (
          <div className="service-image-placeholder">
            <span>🛠️</span>
          </div>
        )}

        <div className="service-category-badge">
          {service?.category?.name || "Service"}
        </div>
      </div>

      {/* =====================================================
                CONTENT
            ===================================================== */}

      <div className="service-card-content">
        <div className="service-card-top">
          <h3 className="service-card-title">
            {service?.name || "Unnamed Service"}
          </h3>

          <div className="service-rating">
            <span>★</span>
            {rating}
          </div>
        </div>

        <p className="service-card-description">
          {service?.description ||
            "Professional local service available through SkillConnect."}
        </p>

        {/* Provider */}

        <div className="service-provider">
          <div className="provider-avatar">
            {providerName.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="provider-label">SERVICE PROVIDER</p>

            <p className="provider-name">{providerName}</p>
          </div>
        </div>

        {/* Location */}

        <div className="service-location">
          <span>📍</span>

          <span>{service?.location || "Location not specified"}</span>
        </div>

        {/* Bottom */}

        <div className="service-card-footer">
          <div>
            <span className="price-label">Starting from</span>

            <p className="service-price">₹{service?.price ?? 0}</p>
          </div>

          <Link
            to={`/services/${service?._id}`}
            className="view-service-button"
          >
            View Details
            <span>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
