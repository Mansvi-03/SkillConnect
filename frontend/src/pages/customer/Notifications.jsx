import { useEffect, useState } from "react";
import api from "../../services/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.notifications || [];

        setNotifications(data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load notifications.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    const value = String(type || "").toLowerCase();

    if (value.includes("booking")) return "📅";
    if (value.includes("payment")) return "💳";
    if (value.includes("review")) return "⭐";
    if (value.includes("message")) return "💬";
    if (value.includes("success")) return "✓";

    return "🔔";
  };

  const getNotificationClass = (type) => {
    const value = String(type || "").toLowerCase();

    if (value.includes("booking")) return "notification-icon-blue";
    if (value.includes("payment")) return "notification-icon-green";
    if (value.includes("review")) return "notification-icon-yellow";
    if (value.includes("message")) return "notification-icon-purple";

    return "notification-icon-blue";
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="notifications-page">
      {/* HERO */}
      <section className="notifications-hero">
        <div className="sc-container notifications-hero-inner">
          <div>
            <span className="notifications-eyebrow">CUSTOMER AREA</span>

            <h1>Notifications</h1>

            <p>
              Stay updated about your bookings, payments and important activity
              on SkillConnect.
            </p>
          </div>

          <div className="notifications-hero-icon">🔔</div>
        </div>
      </section>

      {/* MAIN */}
      <main className="sc-container notifications-main">
        {/* SUMMARY */}
        <div className="notifications-summary">
          <div className="notifications-summary-left">
            <div className="notifications-summary-icon">🔔</div>

            <div>
              <span className="notifications-summary-label">
                YOUR NOTIFICATIONS
              </span>

              <h2>{notifications.length}</h2>

              <p>
                {notifications.length === 1
                  ? "Notification available"
                  : "Notifications available"}
              </p>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="notification-summary-badge">Active</div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="notifications-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="notifications-loading">
            <div className="notification-spinner"></div>

            <p>Loading notifications...</p>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {!loading && notifications.length > 0 && (
          <div className="notifications-list">
            <div className="notifications-list-header">
              <div>
                <span>RECENT ACTIVITY</span>

                <h2>Your Notifications</h2>
              </div>
            </div>

            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${
                  notification.isRead
                    ? "notification-read"
                    : "notification-unread"
                }`}
              >
                <div
                  className={`notification-card-icon ${getNotificationClass(
                    notification.type,
                  )}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>{notification.title || "Notification"}</h3>

                    {!notification.isRead && (
                      <span className="notification-new">NEW</span>
                    )}
                  </div>

                  <p className="notification-message">
                    {notification.message || "You have a new notification."}
                  </p>

                  <span className="notification-time">
                    🕒 {formatDate(notification.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && notifications.length === 0 && !error && (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">🔔</div>

            <span className="notifications-empty-label">ALL CAUGHT UP</span>

            <h2>No notifications yet</h2>

            <p>
              You're all caught up. New updates about your bookings, payments
              and activity will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
