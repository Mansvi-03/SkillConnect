import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import ServiceCard from "../../components/ServiceCard";
import Loading from "../../components/Loading";
import {
  Search,
  MapPin,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  FolderOpen,
  SearchX,
} from "lucide-react";

const Services = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    search: initialSearch,
    category: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterExpanded, setFilterExpanded] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories || response.data || []);
    } catch (err) {
      console.error("Category loading error:", err);
    }
  };

  const fetchServices = async (customFilters = filters) => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (customFilters.search) params.search = customFilters.search;
      if (customFilters.category) params.category = customFilters.category;
      if (customFilters.location) params.location = customFilters.location;
      if (customFilters.minPrice) params.minPrice = customFilters.minPrice;
      if (customFilters.maxPrice) params.maxPrice = customFilters.maxPrice;
      if (customFilters.minRating) params.minRating = customFilters.minRating;

      const response = await api.get("/services", { params });
      setServices(response.data.services || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchServices({
      search: initialSearch,
      category: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
    });
  }, [initialSearch]);

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

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.location ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Local Providers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Explore All Local Services
          </h1>
          <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl font-normal">
            Browse through top-rated professionals for home repairs, maintenance, cleaning, and personal support.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Card */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-5 sm:p-6 mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Filters & Search</h2>
                <p className="text-xs text-slate-500">Fine-tune results by category, budget, and location</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFilterExpanded(!filterExpanded)}
              className="md:hidden text-xs font-bold text-blue-600 px-3 py-1.5 rounded-lg bg-blue-50"
            >
              {filterExpanded ? "Hide Filters" : "Show More Filters"}
            </button>
          </div>

          <form onSubmit={handleSearch} className="mt-5 space-y-4">
            {/* Primary Row: Search & Category & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Keyword Search */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Service Keyword
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleChange}
                    placeholder="Search by title, specialty..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <FolderOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Location / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleChange}
                    placeholder="e.g. Ahmedabad, Mumbai"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Row: Pricing & Rating (Collapsible on mobile) */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 ${filterExpanded ? "block" : "hidden md:grid"}`}>
              {/* Min Price */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleChange}
                  placeholder="₹ 0"
                  min="0"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  placeholder="₹ Max"
                  min="0"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Minimum Rating
                </label>
                <select
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                >
                  <option value="">Any Rating</option>
                  <option value="4">⭐ 4.0 & above</option>
                  <option value="4.5">⭐ 4.5 & above</option>
                  <option value="4.8">⭐ 4.8 & above</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </form>
        </section>

        {/* Results Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {loading ? "Searching for services..." : `${services.length} Services Available`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified local service providers ready for booking
            </p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Content Body */}
        {loading ? (
          <Loading message="Fetching available local services..." />
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Services Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
              We couldn't find any services matching your specific search filters. Try widening your criteria.
            </p>
            <button
              onClick={handleClear}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Services;
