import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users");

      setUsers(response.data.users || []);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmed) {
      return;
    }

    setProcessing(userId);
    setError("");
    setMessage("");

    try {
      await api.delete(`/admin/users/${userId}`);

      setUsers((previous) => previous.filter((user) => user._id !== userId));

      setMessage("User deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete user.");
    } finally {
      setProcessing(null);
    }
  };

  const admins = users.filter((user) => user.role === "admin");

  const customers = users.filter((user) => user.role === "customer");

  const providers = users.filter((user) => user.role === "provider");

  const renderUserTable = (userList) => {
    if (userList.length === 0) {
      return <div className="admin-role-empty">No users in this section.</div>;
    }

    return (
      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {userList.map((user) => (
                <tr key={user._id}>
                  {/* User */}
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-user-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="admin-user-name">{user.name}</p>

                        <p className="admin-user-id">
                          User ID: {user._id.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td>
                    <span className="admin-table-text">{user.email}</span>
                  </td>

                  {/* Phone */}
                  <td>
                    <span className="admin-table-text">
                      {user.phone || "N/A"}
                    </span>
                  </td>

                  {/* Static Role */}
                  <td>
                    <span
                      className={`admin-role-badge admin-role-badge-${user.role}`}
                    >
                      {user.role === "admin"
                        ? "Admin"
                        : user.role === "customer"
                          ? "Customer"
                          : "Service Provider"}
                    </span>
                  </td>

                  {/* Delete */}
                  <td>
                    {user.role !== "admin" ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(user._id)}
                        disabled={processing === user._id}
                        className="admin-delete-button"
                      >
                        {processing === user._id ? "Processing..." : "Delete"}
                      </button>
                    ) : (
                      <span className="admin-protected-badge">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="admin-page">
      <div className="sc-container">
        {/* Header */}
        <section className="admin-page-header">
          <p className="admin-eyebrow">User Management</p>

          <h1 className="admin-page-title">Manage Users</h1>

          <p className="admin-page-subtitle">
            View and manage registered SkillConnect users.
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

        {/* Overall Summary */}
        <div className="admin-user-summary">
          <div className="admin-user-summary-card">
            <span className="admin-user-summary-number">{users.length}</span>

            <span className="admin-user-summary-label">Total Users</span>
          </div>

          <div className="admin-user-summary-card admin-summary-admin">
            <span className="admin-user-summary-number">{admins.length}</span>

            <span className="admin-user-summary-label">Admins</span>
          </div>

          <div className="admin-user-summary-card admin-summary-customer">
            <span className="admin-user-summary-number">
              {customers.length}
            </span>

            <span className="admin-user-summary-label">Customers</span>
          </div>

          <div className="admin-user-summary-card admin-summary-provider">
            <span className="admin-user-summary-number">
              {providers.length}
            </span>

            <span className="admin-user-summary-label">Service Providers</span>
          </div>
        </div>

        {/* Admin Section */}
        <section className="admin-user-role-section">
          <div className="admin-role-section-header">
            <div className="admin-role-section-icon admin-role-section-icon-admin">
              👑
            </div>

            <div>
              <h2>Administrators</h2>

              <p>
                {admins.length}{" "}
                {admins.length === 1 ? "administrator" : "administrators"}
              </p>
            </div>
          </div>

          {renderUserTable(admins)}
        </section>

        {/* Customer Section */}
        <section className="admin-user-role-section">
          <div className="admin-role-section-header">
            <div className="admin-role-section-icon admin-role-section-icon-customer">
              👤
            </div>

            <div>
              <h2>Customers</h2>

              <p>
                {customers.length}{" "}
                {customers.length === 1 ? "customer" : "customers"}
              </p>
            </div>
          </div>

          {renderUserTable(customers)}
        </section>

        {/* Provider Section */}
        <section className="admin-user-role-section">
          <div className="admin-role-section-header">
            <div className="admin-role-section-icon admin-role-section-icon-provider">
              🛠️
            </div>

            <div>
              <h2>Service Providers</h2>

              <p>
                {providers.length}{" "}
                {providers.length === 1
                  ? "service provider"
                  : "service providers"}
              </p>
            </div>
          </div>

          {renderUserTable(providers)}
        </section>
      </div>
    </main>
  );
};

export default ManageUsers;
