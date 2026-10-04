import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";

const ManageServices = () => {
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchServices = async () => {
    try {
      const response = await api.get("/services");

      setServices(response.data.services || []);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load services.");
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
    setMessage("");

    try {
      await api.delete(`/admin/services/${serviceId}`);

      setServices((previous) =>
        previous.filter((service) => service._id !== serviceId),
      );

      setMessage("Service deleted successfully.");
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
    <main className="admin-page">
      <div className="sc-container">
        {/* Header */}
        <section className="admin-page-header">
          <p className="admin-eyebrow">Service Management</p>

          <h1 className="admin-page-title">Manage Services</h1>

          <p className="admin-page-subtitle">
            View and manage services listed by service providers on
            SkillConnect.
          </p>
        </section>

        {/* Messages */}
        {message && (
          <div className="admin-success">
            <span className="admin-message-icon">✓</span>

            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="admin-error">
            <span className="admin-message-icon">!</span>

            <span>{error}</span>
          </div>
        )}

        {/* Summary */}
        <div className="admin-service-summary">
          <div>
            <h2 className="admin-list-title">Listed Services</h2>

            <p className="admin-list-subtitle">
              {services.length} {services.length === 1 ? "service" : "services"}{" "}
              available on SkillConnect
            </p>
          </div>

          <div className="admin-service-count">{services.length}</div>
        </div>

        {/* Empty State */}
        {services.length === 0 ? (
          <div className="admin-empty-card">
            <div className="admin-empty-icon">🛠️</div>

            <h3>No Services Found</h3>

            <p>There are currently no services listed on SkillConnect.</p>
          </div>
        ) : (
          <div className="admin-services-grid">
            {services.map((service) => {
              const image =
                service.images?.length > 0
                  ? `http://localhost:5000${service.images[0]}`
                  : null;

              const providerName =
                service.provider?.user?.name ||
                service.serviceProvider?.user?.name ||
                "N/A";

              return (
                <article key={service._id} className="admin-service-card">
                  {/* Image */}
                  <div className="admin-service-image-wrapper">
                    {image ? (
                      <img
                        src={image}
                        alt={service.name}
                        className="admin-service-image"
                      />
                    ) : (
                      <div className="admin-service-no-image">
                        <span>🛠️</span>
                        <p>No Image</p>
                      </div>
                    )}

                    {service.category?.name && (
                      <span className="admin-service-category">
                        {service.category.name}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="admin-service-content">
                    <h2 className="admin-service-title">{service.name}</h2>

                    <p className="admin-service-description">
                      {service.description}
                    </p>

                    {/* Details */}
                    <div className="admin-service-details">
                      <div className="admin-service-detail">
                        <span className="admin-detail-icon">₹</span>

                        <div>
                          <span className="admin-detail-label">Price</span>

                          <strong>₹{service.price}</strong>
                        </div>
                      </div>

                      <div className="admin-service-detail">
                        <span className="admin-detail-icon">📍</span>

                        <div>
                          <span className="admin-detail-label">Location</span>

                          <strong>{service.location || "N/A"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Provider */}
                    <div className="admin-service-provider">
                      <div className="admin-provider-avatar">
                        {providerName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <span className="admin-detail-label">
                          Service Provider
                        </span>

                        <strong>{providerName}</strong>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(service._id)}
                      disabled={deleting === service._id}
                      className="admin-service-delete-button"
                    >
                      {deleting === service._id
                        ? "Deleting..."
                        : "Delete Service"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageServices;
