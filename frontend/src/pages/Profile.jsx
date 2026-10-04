import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    bio: "",
  });

  const [profileImage, setProfileImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const userId = user?._id || user?.id;

  // ==========================================
  // FETCH PROFILE
  // ==========================================

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
    } else if (user !== undefined) {
      setLoading(false);
    }
  }, [userId]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // ==========================================
  // IMAGE CHANGE
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setProfileImage(file);
    }
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (!userId) {
        throw new Error("User ID not found.");
      }

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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-card">
          <div className="profile-loading-spinner"></div>

          <h2>Loading Your Profile</h2>

          <p>Please wait while we load your SkillConnect profile.</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // LOGIN REQUIRED
  // ==========================================

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

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="profile-error-page">
        <div className="profile-error-card">
          <div className="profile-error-icon">⚠️</div>

          <h2>Profile Could Not Be Loaded</h2>

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

  // ==========================================
  // PROFILE PAGE
  // ==========================================

  return (
    <div className="profile-page">
      <div className="sc-container">
        {/* =====================================
                    PAGE HEADER
                ====================================== */}

        <div className="profile-header">
          <div className="profile-eyebrow">Account</div>

          <h1 className="profile-title">My Profile</h1>

          <p className="profile-subtitle">
            Manage your personal information and SkillConnect profile.
          </p>
        </div>

        {/* =====================================
                    SUCCESS MESSAGE
                ====================================== */}

        {message && <div className="profile-success">{message}</div>}

        {/* =====================================
                    PROFILE LAYOUT
                ====================================== */}

        <div className="profile-layout">
          {/* =================================
                        LEFT PROFILE CARD
                    ================================= */}

          <div className="profile-card">
            <div className="profile-card-top">
              <div className="profile-avatar">
                {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
              </div>

              <h2 className="profile-name">{formData.name || "User"}</h2>

              <p className="profile-email">{user.email}</p>

              <span className="profile-role">
                {user.role === "provider" ? "Service Provider" : user.role}
              </span>
            </div>

            {/* PROFILE INFORMATION */}

            <div className="profile-info">
              <div className="profile-info-item">
                <div className="profile-info-label">Phone</div>

                <div className="profile-info-value">
                  {formData.phone || "Not available"}
                </div>
              </div>

              {user.role !== "admin" && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* =================================
                        RIGHT FORM CARD
                    ================================= */}

          <div className="profile-form-card">
            <div className="profile-form-header">
              <h2>Personal Information</h2>

              <p>Update your information below.</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              {/* NAME */}

              <div className="profile-field full">
                <label htmlFor="profile-name">Full Name</label>

                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* EMAIL */}

              <div className="profile-field">
                <label htmlFor="profile-email">Email Address</label>

                <input
                  id="profile-email"
                  type="email"
                  value={user.email || ""}
                  disabled
                />
              </div>

              {/* PHONE */}

              <div className="profile-field">
                <label htmlFor="profile-phone">Phone Number</label>

                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* ADDRESS */}

              {user.role !== "admin" && (
                <div className="profile-field">
                  <label htmlFor="profile-address">Address</label>

                  <input
                    id="profile-address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                  />
                </div>
              )}

              {/* CITY */}

              {user.role !== "admin" && (
                <div className="profile-field">
                  <label htmlFor="profile-city">City</label>

                  <input
                    id="profile-city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                  />
                </div>
              )}

              {/* PROVIDER BIO */}

              {user.role === "provider" && (
                <div className="profile-field full">
                  <label htmlFor="profile-bio">Professional Bio</label>

                  <textarea
                    id="profile-bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell customers about your skills and experience..."
                  />
                </div>
              )}

              {/* IMAGE */}

              {user.role !== "admin" && (
                <div className="profile-field full">
                  <label htmlFor="profile-image">Profile Image</label>

                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="profile-file"
                  />

                  {profileImage && (
                    <p
                      style={{
                        marginTop: "8px",
                        color: "var(--primary)",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Selected: {profileImage.name}
                    </p>
                  )}
                </div>
              )}

              {/* SAVE BUTTON */}

              <button
                type="submit"
                disabled={saving}
                className="profile-save-button"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
