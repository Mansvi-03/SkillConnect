import { useEffect, useState } from "react";
import api from "../../services/api";
import ServiceCard from "../../components/ServiceCard";
import Loading from "../../components/Loading";

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      setCategories(response.data.categories || response.data || []);
    } catch (error) {
      console.error("Category loading error:", error);
    }
  };

  const fetchServices = async (customFilters = filters) => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (customFilters.search) {
        params.search = customFilters.search;
      }

      if (customFilters.category) {
        params.category = customFilters.category;
      }

      if (customFilters.location) {
        params.location = customFilters.location;
      }

      if (customFilters.minPrice) {
        params.minPrice = customFilters.minPrice;
      }

      if (customFilters.maxPrice) {
        params.maxPrice = customFilters.maxPrice;
      }

      if (customFilters.minRating) {
        params.minRating = customFilters.minRating;
      }

      const response = await api.get("/services", {
        params,
      });

      setServices(response.data.services || []);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load services.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();

    fetchServices(filters);
  };

  const handleClear = () => {
    const emptyFilters = {
      search: "",
      category: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
    };

    setFilters(emptyFilters);

    fetchServices(emptyFilters);
  };

  return (
    <div className="services-page">
      {/* =====================================================
                PAGE HERO
            ===================================================== */}

      <section className="services-hero">
        <div className="sc-container">
          <div className="services-hero-content">
            <span className="services-eyebrow">LOCAL MARKETPLACE</span>

            <h1>Explore Local Services</h1>

            <p>
              Find skilled professionals and services that match your needs,
              location and budget.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

      <main className="services-main">
        <div className="sc-container">
          {/* =================================================
                        FILTER PANEL
                    ================================================= */}

          <section className="services-filter-card">
            <div className="filter-header">
              <div>
                <h2>Find the right service</h2>

                <p>Search and filter services based on your requirements.</p>
              </div>

              <span className="filter-icon">⚙️</span>
            </div>

            <form onSubmit={handleSearch} className="filter-form">
              {/* Search */}

              <div className="filter-field filter-search">
                <label>Search</label>

                <div className="input-with-icon">
                  <span>🔍</span>

                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleChange}
                    placeholder="What service are you looking for?"
                  />
                </div>
              </div>

              {/* Category */}

              <div className="filter-field">
                <label>Category</label>

                <select
                  name="category"
                  value={filters.category}
                  onChange={handleChange}
                >
                  <option value="">All Categories</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}

              <div className="filter-field">
                <label>Location</label>

                <div className="input-with-icon">
                  <span>📍</span>

                  <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                  />
                </div>
              </div>

              {/* Minimum price */}

              <div className="filter-field">
                <label>Minimum Price</label>

                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleChange}
                  placeholder="₹ Min"
                  min="0"
                />
              </div>

              {/* Maximum price */}

              <div className="filter-field">
                <label>Maximum Price</label>

                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  placeholder="₹ Max"
                  min="0"
                />
              </div>

              {/* Rating */}

              <div className="filter-field">
                <label>Minimum Rating</label>

                <select
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleChange}
                >
                  <option value="">Any Rating</option>

                  <option value="4">⭐ 4.0+</option>

                  <option value="4.5">⭐ 4.5+</option>

                  <option value="4.8">⭐ 4.8+</option>
                </select>
              </div>

              {/* Buttons */}

              <div className="filter-actions">
                <button type="submit" className="services-search-button">
                  🔍 Search Services
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="services-clear-button"
                >
                  Clear Filters
                </button>
              </div>
            </form>
          </section>

          {/* =================================================
                        RESULTS HEADER
                    ================================================= */}

          <div className="services-results-header">
            <div>
              <p className="results-label">SERVICE RESULTS</p>

              <h2>
                {loading
                  ? "Finding services..."
                  : `${services.length} ${
                      services.length === 1 ? "service" : "services"
                    } found`}
              </h2>
            </div>

            {!loading && services.length > 0 && (
              <div className="results-count">{services.length} available</div>
            )}
          </div>

          {/* =================================================
                        ERROR
                    ================================================= */}

          {error && (
            <div className="services-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* =================================================
                        LOADING
                    ================================================= */}

          {loading && <Loading />}

          {/* =================================================
                        SERVICES
                    ================================================= */}

          {!loading && !error && services.length > 0 && (
            <div className="services-grid">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}

          {/* =================================================
                        EMPTY STATE
                    ================================================= */}

          {!loading && !error && services.length === 0 && (
            <div className="services-empty">
              <div className="empty-icon">🔎</div>

              <h2>No services found</h2>

              <p>
                We couldn't find any services matching your current filters.
              </p>

              <button onClick={handleClear} className="empty-button">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Services;
