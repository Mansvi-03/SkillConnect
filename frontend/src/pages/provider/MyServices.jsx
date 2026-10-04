import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  Briefcase,
  Plus,
  Clock,
  Edit2,
  Trash2,
  MapPin,
  Star,
  AlertCircle,
  Wrench,
  Calendar,
  Sparkles,
} from "lucide-react";

const MyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/services/my-services");
      setServices(response.data.services || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your service listings.",
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
      "Are you sure you want to remove this service listing from your profile?",
    );
    if (!confirmed) return;

    setDeleting(serviceId);
    setError("");

    try {
      await api.delete(`/services/${serviceId}`);
      setServices((prev) => prev.filter((s) => s._id !== serviceId));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete service.");
    } finally {
      setDeleting(null);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `http://localhost:5000${image.startsWith("/") ? image : `/${image}`}`;
  };

  if (loading) {
    return <Loading message="Loading your services catalog..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Provider Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              My Service Offerings
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Manage your active listings, set hourly or flat rates, and schedule available hours.
            </p>
          </div>

          <Link
            to="/provider/services/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Service</span>
          </Link>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            {services.length} {services.length === 1 ? "Service Listing" : "Service Listings"}
          </p>
        </div>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const image = service.images?.[0] ? getImageUrl(service.images[0]) : null;

              return (
                <article
                  key={service._id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={service.name}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                        <Wrench className="w-8 h-8 text-blue-500 mb-1" />
                        <span className="text-[11px] font-medium">Service Listing</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm">
                        {service.category?.name || "Service"}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-sm">
                        ₹{service.price}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                      {service.name}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {service.description || "No description provided."}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{service.location || "Local region"}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{Number(service.averageRating || 5).toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Action buttons toolbar */}
                    <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                      <Link
                        to={`/provider/services/${service._id}/availability`}
                        className="py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Set Open Booking Slots"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Hours</span>
                      </Link>

                      <Link
                        to={`/provider/services/edit/${service._id}`}
                        className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Edit Details & Pricing"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(service._id)}
                        disabled={deleting === service._id}
                        className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                        title="Remove Service"
                      >
                        {deleting === service._id ? (
                          <div className="w-3.5 h-3.5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Services Added Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto mb-6">
              Create your first service listing so customers in your area can discover and book your expertise.
            </p>
            <Link
              to="/provider/services/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Service</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyServices;
