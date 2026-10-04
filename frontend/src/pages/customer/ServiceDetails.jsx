import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";

const ServiceDetails = () => {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await api.get(`/services/${id}`);

        setService(response.data.service);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load service.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="service-details-page">
        <div className="sc-container">
          <div className="service-details-error">
            <div className="service-details-error-icon">!</div>

            <h2>Unable to load service</h2>

            <p>{error}</p>

            <Link to="/services" className="service-details-back-button">
              Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-details-page">
        <div className="sc-container">
          <div className="service-details-error">
            <div className="service-details-error-icon">?</div>

            <h2>Service not found</h2>

            <p>The service you're looking for does not exist.</p>

            <Link to="/services" className="service-details-back-button">
              Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Service images
   *
   * Backend stores images like:
   * /uploads/image.jpg
   *
   * Backend runs on:
   * http://localhost:5000
   */
  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `http://localhost:5000${
      image.startsWith("/") ? image : `/${image}`
    }`;
  };

  const images = service.images || [];

  const provider = service.provider;
  const providerUser = provider?.user;

  const mainImage = images.length > 0 ? getImageUrl(images[selectedImage]) : "";

  return (
    <div className="service-details-page">
      {/* =========================
          PAGE HEADER
      ========================== */}
      <section className="service-details-header">
        <div className="sc-container">
          <Link to="/services" className="service-details-back">
            ← Back to Services
          </Link>

          <div className="service-details-header-content">
            <span className="service-details-eyebrow">Service Details</span>

            <h1 className="service-details-title">{service.name}</h1>

            <p className="service-details-subtitle">
              Explore the service, provider information and availability.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <section className="service-details-content">
        <div className="sc-container">
          <div className="service-details-layout">
            {/* =========================
                LEFT SIDE
            ========================== */}
            <div className="service-details-gallery">
              {/* MAIN IMAGE */}
              <div className="service-main-image-card">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={service.name}
                    className="service-main-image"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="service-image-placeholder">
                    <span>🛠️</span>

                    <p>No image available</p>
                  </div>
                )}
              </div>

              {/* IMAGE THUMBNAILS */}
              {images.length > 1 && (
                <div className="service-image-thumbnails">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`service-thumbnail ${
                        selectedImage === index
                          ? "service-thumbnail-active"
                          : ""
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${service.name} ${index + 1}`}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* QUICK INFORMATION */}
              <div className="service-quick-info">
                <div className="service-quick-item">
                  <span className="service-quick-icon">📍</span>

                  <div>
                    <span className="service-quick-label">Location</span>

                    <strong>{service.location || "N/A"}</strong>
                  </div>
                </div>

                <div className="service-quick-item">
                  <span className="service-quick-icon">⭐</span>

                  <div>
                    <span className="service-quick-label">Rating</span>

                    <strong>{service.averageRating || 0}</strong>
                  </div>
                </div>

                <div className="service-quick-item">
                  <span className="service-quick-icon">💬</span>

                  <div>
                    <span className="service-quick-label">Reviews</span>

                    <strong>{service.totalReviews || 0}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================
                RIGHT SIDE
            ========================== */}
            <div className="service-details-main">
              {/* SERVICE INFORMATION CARD */}
              <div className="service-details-card">
                <div className="service-details-card-top">
                  <span className="service-category-badge">
                    {service.category?.name || "Service"}
                  </span>

                  <div className="service-rating">
                    <span>★</span>

                    <strong>{service.averageRating || 0}</strong>

                    <span className="service-rating-count">
                      ({service.totalReviews || 0})
                    </span>
                  </div>
                </div>

                <h2 className="service-details-name">{service.name}</h2>

                <div className="service-price">
                  ₹{service.price}
                  <span>/ service</span>
                </div>

                <div className="service-details-divider" />

                {/* DESCRIPTION */}
                <div className="service-description-section">
                  <h3>About this service</h3>

                  <p>
                    {service.description ||
                      "No description available for this service."}
                  </p>
                </div>

                {/* SERVICE INFORMATION */}
                <div className="service-information-grid">
                  <div className="service-information-item">
                    <span className="service-information-icon">📍</span>

                    <div>
                      <span>Location</span>

                      <strong>{service.location || "N/A"}</strong>
                    </div>
                  </div>

                  <div className="service-information-item">
                    <span className="service-information-icon">📂</span>

                    <div>
                      <span>Category</span>

                      <strong>{service.category?.name || "N/A"}</strong>
                    </div>
                  </div>
                </div>

                {/* CHECK AVAILABILITY */}
                <Link
                  to={`/customer/book-service/${service._id}`}
                  className="service-check-button"
                >
                  <span>Check Availability</span>

                  <span>→</span>
                </Link>
              </div>

              {/* =========================
                  SERVICE PROVIDER CARD
              ========================== */}
              <div className="service-provider-card">
                <div className="service-provider-header">
                  <div className="service-provider-avatar">
                    {providerUser?.name
                      ? providerUser.name.charAt(0).toUpperCase()
                      : "P"}
                  </div>

                  <div>
                    <span className="service-provider-eyebrow">
                      Service Provider
                    </span>

                    <h3>{providerUser?.name || "Provider"}</h3>
                  </div>
                </div>

                {/* PROVIDER DETAILS */}
                <div className="service-provider-details">
                  <div className="service-provider-detail">
                    <span>📞</span>

                    <div>
                      <small>Phone</small>

                      <strong>{providerUser?.phone || "N/A"}</strong>
                    </div>
                  </div>

                  <div className="service-provider-detail">
                    <span>✉️</span>

                    <div>
                      <small>Email</small>

                      <strong>{providerUser?.email || "N/A"}</strong>
                    </div>
                  </div>

                  <div className="service-provider-detail">
                    <span>📍</span>

                    <div>
                      <small>City</small>

                      <strong>
                        {provider?.city || service.location || "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* PROVIDER BIO */}
                {provider?.bio && (
                  <div className="service-provider-bio">
                    <span>About Provider</span>

                    <p>{provider.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetails;
