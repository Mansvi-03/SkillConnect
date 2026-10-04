import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  Calendar,
  Clock,
  MessageSquare,
  Star,
  ArrowRight,
  AlertCircle,
  Wrench,
  ChevronRight,
} from "lucide-react";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/bookings");
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError(
        err.response?.data?.message || "Unable to load your bookings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusBadge = (status) => {
    const s = String(status || "Pending").toLowerCase();
    switch (s) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "accepted":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "cancelled":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date pending";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeSlot) => {
    if (!timeSlot) return "Time not specified";
    if (typeof timeSlot === "string") return timeSlot;
    if (timeSlot.startTime && timeSlot.endTime) {
      return `${timeSlot.startTime} - ${timeSlot.endTime}`;
    }
    return "Time not specified";
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return String(b.status || "").toLowerCase() === activeTab;
  });

  if (loading) {
    return <Loading message="Retrieving your bookings..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Customer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              My Bookings
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Review current appointments, chat with providers, and track completion.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
          >
            <span>+ Book New Service</span>
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Tab Filters Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm flex items-center gap-2 overflow-x-auto">
          {[
            { id: "all", label: "All Bookings", count: bookings.length },
            {
              id: "pending",
              label: "Pending",
              count: bookings.filter((b) => b.status?.toLowerCase() === "pending").length,
            },
            {
              id: "accepted",
              label: "Accepted",
              count: bookings.filter((b) => b.status?.toLowerCase() === "accepted").length,
            },
            {
              id: "completed",
              label: "Completed",
              count: bookings.filter((b) => b.status?.toLowerCase() === "completed").length,
            },
            {
              id: "cancelled",
              label: "Cancelled",
              count: bookings.filter((b) => b.status?.toLowerCase() === "cancelled").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Service & Provider Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${getStatusBadge(
                          b.status,
                        )}`}
                      >
                        {b.status || "Pending"}
                      </span>
                      <span className="text-xs text-slate-600 font-mono">
                        ID: {b._id?.slice(-6)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {b.service?.name || b.serviceName || "Service Booking"}
                    </h3>

                    {/* Meta Specs */}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold text-slate-700">
                          {formatDate(b.bookingDate || b.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{formatTime(b.timeSlot)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Provider:</span>
                        <span className="font-semibold text-slate-800">
                          {b.provider?.user?.name || b.provider?.name || "Local Pro"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Price & Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-end sm:items-center md:items-end lg:items-center justify-between md:justify-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xs text-slate-600 block">Total Amount</span>
                    <span className="text-xl font-black text-slate-900">
                      ₹{b.amount || b.totalAmount || b.price || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Chat with Provider */}
                    <Link
                      to={`/customer/chat/${b._id}`}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-white transition-colors"
                      title="Chat with Provider"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>

                    {/* Review Button if Completed */}
                    {b.status?.toLowerCase() === "completed" && (
                      <Link
                        to={`/customer/reviews/${b._id}`}
                        className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                        title="Leave Review"
                      >
                        <Star className="w-4 h-4" />
                      </Link>
                    )}

                    {/* Track Booking Button */}
                    <Link
                      to={`/customer/bookings/${b._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm"
                    >
                      <span>Track Status</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Bookings in this Category</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto mb-6">
              You don't have any {activeTab === "all" ? "" : activeTab} bookings currently.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20"
            >
              <span>Explore Available Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
