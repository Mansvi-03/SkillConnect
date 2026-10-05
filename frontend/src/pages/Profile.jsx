import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  X,
} from "lucide-react";

const Profile = () => {
  const { user, updateUser, logout } = useAuth();

  const navigate = useNavigate();

  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    bio: "",
  });

  const [profileImage, setProfileImage] = useState(null);

  // =====================================================
  // PAGE STATE
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  // =====================================================
  // PASSWORD STATE
  // =====================================================

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");

  const [passwordError, setPasswordError] = useState("");

  // =====================================================
  // DELETE STATE
  // =====================================================

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const userId = user?._id || user?.id;

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        if (!userId) {
          throw new Error("User ID not found. Please login again.");
        }

        const response = await api.get(`/profiles/${userId}`);

        const userData = response.data.user;

        const profileData = response.data.profile;

        setFormData({
          name: userData?.name || "",
          phone: userData?.phone || "",
          address: profileData?.address || "",
          city: profileData?.city || "",
          bio: profileData?.bio || "",
        });
      } catch (err) {
        console.error("PROFILE FETCH ERROR:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // =====================================================
  // IMAGE CHANGE
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setProfileImage(file);
    }
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const data = new FormData();

      data.append("name", formData.name);

      data.append("phone", formData.phone);

      data.append("address", formData.address);

      data.append("city", formData.city);

      if (user?.role === "provider") {
        data.append("bio", formData.bio);
      }

      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      const response = await api.put(`/profiles/${userId}`, data);

      const updatedUser = {
        ...user,
        name: formData.name,
        phone: formData.phone,
      };

      updateUser(response.data.user || updatedUser);

      setMessage("Profile updated successfully.");

      setProfileImage(null);
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("New password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      await api.put(`/profiles/${userId}/change-password`, {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage("Password changed successfully.");
    } catch (err) {
      console.error("CHANGE PASSWORD ERROR:", err);

      setPasswordError(
        err.response?.data?.message || "Unable to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // =====================================================
  // DELETE ACCOUNT
  // =====================================================

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      setError("");

      const response = await api.delete(`/profiles/${userId}`);

      // Clear authentication
      await logout();

      // Redirect
      navigate("/login", {
        replace: true,
        state: {
          accountDeleted:
            response.data.message ||
            "Your account has been deleted successfully.",
        },
      });
    } catch (err) {
      console.error("DELETE ACCOUNT ERROR:", err);

      setShowDeleteModal(false);

      setError(err.response?.data?.message || "Unable to delete your account.");
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-card">
          <div className="profile-loading-spinner" />

          <h2>Loading Your Profile</h2>

          <p>Please wait while we load your SkillConnect profile.</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // LOGIN REQUIRED
  // =====================================================

  if (!user || !userId) {
    return (
      <div className="profile-error-page">
        <div className="profile-error-card">
          <div className="profile-error-icon">🔐</div>

          <h2>Login Required</h2>

          <p>Please login again to access your profile.</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PROFILE ERROR
  // =====================================================

  if (error) {
    return (
      <div className="profile-error-page">
        <div className="profile-error-card">
          <div className="profile-error-icon">⚠️</div>

          <h2>Profile Error</h2>

          <p>{error}</p>

          <button
            type="button"
            className="profile-retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // PROFILE PAGE
  // =====================================================

  return (
    <div className="profile-page">
      <div className="sc-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="profile-header">
          <div className="profile-eyebrow">Account</div>

          <h1 className="profile-title">My Profile</h1>

          <p className="profile-subtitle">
            Manage your personal information and SkillConnect account.
          </p>
        </div>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {message && (
          <div className="profile-success">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {/* =================================================
            PROFILE LAYOUT
        ================================================= */}

        <div className="profile-layout">
          {/* =================================================
              LEFT CARD
          ================================================= */}

          <div className="profile-card">
            <div className="profile-card-top">
              <div className="profile-avatar">
                {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
              </div>

              <h2 className="profile-name">{formData.name || "User"}</h2>

              <p className="profile-email">{user.email}</p>

              <span className="profile-role">
                {user.role === "provider" ? "Service Provider" : "Customer"}
              </span>
            </div>

            <div className="profile-info">
              <div className="profile-info-item">
                <div className="profile-info-label">Phone</div>

                <div className="profile-info-value">
                  {formData.phone || "Not available"}
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-label">City</div>

                <div className="profile-info-value">
                  {formData.city || "Not available"}
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-label">Address</div>

                <div className="profile-info-value">
                  {formData.address || "Not available"}
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT FORM
          ================================================= */}

          <div className="profile-form-card">
            <div className="profile-form-header">
              <h2>Personal Information</h2>

              <p>Update your information below.</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              {/* NAME */}

              <div className="profile-field full">
                <label>Full Name</label>

                <div className="profile-input-icon">
                  <User size={17} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div className="profile-field">
                <label>Email Address</label>

                <div className="profile-input-icon disabled">
                  <Mail size={17} />

                  <input type="email" value={user.email || ""} disabled />
                </div>
              </div>

              {/* PHONE */}

              <div className="profile-field">
                <label>Phone Number</label>

                <div className="profile-input-icon">
                  <Phone size={17} />

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* ADDRESS */}

              <div className="profile-field">
                <label>Address</label>

                <div className="profile-input-icon">
                  <MapPin size={17} />

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* CITY */}

              <div className="profile-field">
                <label>City</label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              {/* PROVIDER BIO */}

              {user.role === "provider" && (
                <div className="profile-field full">
                  <label>Professional Bio</label>

                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell customers about your skills and experience..."
                  />
                </div>
              )}

              {/* PROFILE IMAGE */}

              <div className="profile-field full">
                <label>Profile Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="profile-file"
                />

                {profileImage && (
                  <p className="profile-file-name">
                    Selected: {profileImage.name}
                  </p>
                )}
              </div>

              {/* SAVE */}

              <button
                type="submit"
                disabled={saving}
                className="profile-save-button"
              >
                <Save size={17} />

                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        {/* =================================================
            CHANGE PASSWORD
        ================================================= */}

        <section className="profile-security-card">
          <div className="profile-security-header">
            <div className="profile-security-icon">
              <Lock size={21} />
            </div>

            <div>
              <h2>Change Password</h2>

              <p>Update your password to keep your account secure.</p>
            </div>
          </div>

          {passwordMessage && (
            <div className="profile-password-success">
              <CheckCircle2 size={17} />
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="profile-password-error">
              <AlertTriangle size={17} />
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="password-form">
            {/* CURRENT PASSWORD */}

            <div className="password-field">
              <label>Current Password</label>

              <div className="password-input-wrapper">
                <Lock size={17} />

                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((value) => !value)}
                  className="password-eye-button"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* NEW PASSWORD */}

            <div className="password-field">
              <label>New Password</label>

              <div className="password-input-wrapper">
                <Lock size={17} />

                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="password-eye-button"
                >
                  {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="password-field">
              <label>Confirm New Password</label>

              <div className="password-input-wrapper">
                <Lock size={17} />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="password-eye-button"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="change-password-button"
            >
              <ShieldCheck size={17} />

              {changingPassword ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </section>

        {/* =================================================
            DANGER ZONE
        ================================================= */}

        {(user.role === "customer" || user.role === "provider") && (
          <section className="profile-danger-card">
            <div className="profile-danger-content">
              <div className="profile-danger-icon">
                <Trash2 size={21} />
              </div>

              <div>
                <h2>Delete Account</h2>

                <p>
                  Permanently delete your SkillConnect account. Completed
                  bookings, payments and history will remain available as
                  historical records.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="delete-account-button"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={17} />
              Delete My Account
            </button>
          </section>
        )}
      </div>

      {/* =================================================
          DELETE CONFIRMATION MODAL
      ================================================= */}

      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <button
              type="button"
              className="delete-modal-close"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              <X size={19} />
            </button>

            <div className="delete-modal-icon">
              <AlertTriangle size={25} />
            </div>

            <h2>Delete Your Account?</h2>

            <p>
              This action cannot be undone. Your account and profile will be
              permanently removed.
            </p>

            <div className="delete-modal-warning">
              <strong>Before deletion:</strong>

              <ul>
                <li>Pending bookings will be cancelled.</li>

                <li>
                  Accepted/in-progress bookings will block deletion until the
                  work is completed.
                </li>

                <li>Completed bookings and payment history will remain.</li>
              </ul>
            </div>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-cancel-button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Keep My Account
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
