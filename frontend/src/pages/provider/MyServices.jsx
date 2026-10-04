import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";

const MyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchServices = async () => {
    try {
      const response = await api.get("/services/my-services");

      setServices(response.data.services || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load your services.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (serviceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(serviceId);
    setError("");

    try {
      await api.delete(`/services/${serviceId}`);

      setServices((previous) =>
        previous.filter((service) => service._id !== serviceId),
      );
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete service.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="provider-services-page">
      <div className="sc-container">
        {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

        <div className="provider-services-header">
          <div>
            <p className="provider-services-eyebrow">Provider Workspace</p>

            <h1 className="provider-services-title">My Services</h1>

            <p className="provider-services-subtitle">
              Manage the services you provide to customers.
            </p>
          </div>

          <Link
            to="/provider/services/add"
            className="provider-services-add-button"
          >
            <span>+</span>
            Add Service
          </Link>
        </div>

        {/* =====================================================
                    ERROR
                ===================================================== */}

        {error && (
          <div className="provider-services-error">
            <span className="provider-services-error-icon">⚠️</span>

            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
                    SERVICE COUNT
                ===================================================== */}

        {services.length > 0 && (
          <div className="provider-services-summary">
            <div>
              <span className="provider-services-summary-icon">🛠️</span>

              <div>
                <strong>{services.length}</strong>

                <span>
                  {services.length === 1 ? " service" : " services"} listed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
                    EMPTY STATE
                ===================================================== */}

        {services.length === 0 ? (
          <div className="provider-services-empty">
            <div className="provider-services-empty-icon">🛠️</div>

            <h2>No services yet</h2>

            <p>
              Create your first service to start receiving bookings from
              customers.
            </p>

            <Link
              to="/provider/services/add"
              className="provider-services-empty-button"
            >
              + Add Your First Service
            </Link>
          </div>
        ) : (
          /* =====================================================
                      SERVICES GRID
                  ===================================================== */

          <div className="provider-services-grid">
            {services.map((service) => {
              const image =
                service.images?.length > 0
                  ? `http://localhost:5000${service.images[0]}`
                  : null;

              return (
                <article key={service._id} className="provider-service-card">
                  {/* =================================================
                              IMAGE
                          ================================================= */}

                  <div className="provider-service-image-wrapper">
                    {image ? (
                      <img
                        src={image}
                        alt={service.name}
                        className="provider-service-image"
                      />
                    ) : (
                      <div className="provider-service-image-placeholder">
                        <span>🛠️</span>
                        <p>No image available</p>
                      </div>
                    )}

                    <div className="provider-service-status">
                      <span className="provider-service-status-dot"></span>

                      {service.isActive === false ? "Inactive" : "Active"}
                    </div>
                  </div>

                  {/* =================================================
                              CONTENT
                          ================================================= */}

                  <div className="provider-service-content">
                    <div className="provider-service-top">
                      <div>
                        {service.category?.name && (
                          <span className="provider-service-category">
                            {service.category.name}
                          </span>
                        )}

                        <h2 className="provider-service-name">
                          {service.name}
                        </h2>
                      </div>
                    </div>

                    <p className="provider-service-description">
                      {service.description}
                    </p>

                    {/* Price + Rating */}

                    <div className="provider-service-meta">
                      <div className="provider-service-price">
                        ₹{service.price}
                      </div>

                      <div className="provider-service-rating">
                        <span>★</span>

                        {service.averageRating || 0}
                      </div>
                    </div>

                    {/* Location */}

                    <div className="provider-service-location">
                      <span>📍</span>

                      <span>{service.location}</span>
                    </div>

                    {/* =================================================
                                ACTIONS
                            ================================================= */}

                    <div className="provider-service-actions">
                      <Link
                        to={`/provider/services/edit/${service._id}`}
                        className="provider-service-edit-button"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(service._id)}
                        disabled={deleting === service._id}
                        className="provider-service-delete-button"
                      >
                        {deleting === service._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>

                    <Link
                      to={`/provider/services/${service._id}/availability`}
                      className="provider-service-availability"
                    >
                      <span>📅</span>
                      Manage Availability
                      <span className="provider-service-arrow">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServices;
