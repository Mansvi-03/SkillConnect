import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  Layers,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Star,
  MapPin,
  ExternalLink,
  Wrench,
} from "lucide-react";

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/services");
      setServices(response.data.services || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load services catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (serviceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service listing from the platform?",
    );
    if (!confirmed) return;

    setDeleting(serviceId);
    setError("");
    setMessage("");

    try {
      await api.delete(`/admin/services/${serviceId}`);
      setServices((prev) => prev.filter((s) => s._id !== serviceId));
      setMessage("Service removed from catalog successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete service.");
    } finally {
      setDeleting(null);
    }
  };

  const filteredServices = services.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.location?.toLowerCase().includes(term) ||
      s.category?.name?.toLowerCase().includes(term) ||
      s.provider?.user?.name?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <Loading message="Loading services catalog moderation..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Dashboard</span>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Content Moderation
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Manage Listed Services
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review, moderate, and remove services published by providers across SkillConnect.
            </p>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <p>{error}</p>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            {services.length} {services.length === 1 ? "Service Listed" : "Services Listed"}
          </p>

          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services, provider, location..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {filteredServices.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No services found matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{s.name}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{s.location || "Local region"}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {s.category?.name || "General"}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-800">
                        {s.provider?.user?.name || "Provider"}
                      </td>

                      <td className="px-6 py-4 font-black text-slate-900">
                        ₹{s.price}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{Number(s.averageRating || 5).toFixed(1)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/services/${s._id}`}
                            target="_blank"
                            className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="View Public Service Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(s._id)}
                            disabled={deleting === s._id}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                            title="Remove Service Listing"
                          >
                            {deleting === s._id ? (
                              <div className="w-4 h-4 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageServices;
