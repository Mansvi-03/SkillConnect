import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const AddService = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    location: "",
  });

  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");

        setCategories(response.data.categories || []);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("price", formData.price);
      data.append("location", formData.location);

      Array.from(images).forEach((image) => {
        data.append("images", image);
      });

      await api.post("/services", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/provider/services");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to create service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-service-page">
      <div className="sc-container">
        {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

        <div className="add-service-header">
          <div>
            <p className="add-service-eyebrow">Provider Workspace</p>

            <h1 className="add-service-title">Add Service</h1>

            <p className="add-service-subtitle">
              Create a new service and let customers discover your expertise.
            </p>
          </div>

          <Link to="/provider/services" className="add-service-back-button">
            ← My Services
          </Link>
        </div>

        {/* =====================================================
                    FORM CARD
                ===================================================== */}

        <div className="add-service-card">
          {/* Form introduction */}

          <div className="add-service-card-header">
            <div className="add-service-card-icon">+</div>

            <div>
              <h2>Create Your Service</h2>

              <p>
                Provide accurate details so customers can easily understand your
                service.
              </p>
            </div>
          </div>

          {/* =====================================================
                        ERROR
                    ===================================================== */}

          {error && (
            <div className="add-service-error">
              <span className="add-service-error-icon">⚠️</span>

              <span>{error}</span>
            </div>
          )}

          {/* =====================================================
                        FORM
                    ===================================================== */}

          <form onSubmit={handleSubmit} className="add-service-form">
            {/* SERVICE NAME */}

            <div className="add-service-field full">
              <label htmlFor="service-name">Service Name</label>

              <input
                id="service-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Home Cleaning"
                required
              />

              <span className="add-service-help">
                Give your service a clear and simple name.
              </span>
            </div>

            {/* DESCRIPTION */}

            <div className="add-service-field full">
              <label htmlFor="service-description">Description</label>

              <textarea
                id="service-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Describe what your service includes..."
                required
              />

              <span className="add-service-help">
                Explain what customers can expect from your service.
              </span>
            </div>

            {/* CATEGORY */}

            <div className="add-service-field full">
              <label htmlFor="service-category">Category</label>

              <select
                id="service-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories
                    ? "Loading categories..."
                    : "Select Category"}
                </option>

                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PRICE */}

            <div className="add-service-field">
              <label htmlFor="service-price">Price</label>

              <div className="add-service-input-prefix">
                <span>₹</span>

                <input
                  id="service-price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  placeholder="Enter price"
                  required
                />
              </div>

              <span className="add-service-help">
                Set the price customers will see.
              </span>
            </div>

            {/* LOCATION */}

            <div className="add-service-field">
              <label htmlFor="service-location">Location</label>

              <div className="add-service-input-prefix">
                <span>📍</span>

                <input
                  id="service-location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Anand"
                  required
                />
              </div>

              <span className="add-service-help">
                Enter the area where you provide the service.
              </span>
            </div>

            {/* =================================================
                        IMAGES
                    ================================================= */}

            <div className="add-service-field full">
              <label htmlFor="service-images">Service Images</label>

              <label htmlFor="service-images" className="add-service-upload">
                <div className="add-service-upload-icon">🖼️</div>

                <div className="add-service-upload-content">
                  <strong>
                    {images.length > 0
                      ? `${images.length} image${
                          images.length > 1 ? "s" : ""
                        } selected`
                      : "Upload service images"}
                  </strong>

                  <span>Click here to choose one or more images</span>
                </div>

                <span className="add-service-upload-button">Choose</span>
              </label>

              <input
                id="service-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="add-service-hidden-file"
              />

              <span className="add-service-help">
                You can select multiple images. Clear, high-quality images help
                customers understand your service.
              </span>
            </div>

            {/* =================================================
                        SUBMIT
                    ================================================= */}

            <div className="add-service-submit-area">
              <Link
                to="/provider/services"
                className="add-service-cancel-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="add-service-submit-button"
              >
                {loading ? "Creating Service..." : "Create Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddService;
