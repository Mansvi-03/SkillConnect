import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Check,
  X,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Wrench,
  Sparkles,
} from "lucide-react";

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/bookings");
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error("Fetch provider bookings error:", err);
      setError(err.response?.data?.message || "Unable to load customer bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAction = async (bookingId, action) => {
    try {
      setActionLoading(`${bookingId}-${action}`);
      setError("");
      await api.put(`/bookings/${bookingId}/${action}`);
      await fetchBookings();
    } catch (err) {
      console.error(`${action} booking error:`, err);
      setError(err.response?.data?.message || `Unable to ${action} booking.`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date not available";
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

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return String(b.status || "").toLowerCase() === activeTab;
  });

  if (loading) {
    return <Loading message="Loading customer booking requests..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Provider Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Customer Bookings
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Accept client appointments, coordinate service delivery, and mark completed jobs.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Tab Filters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm flex items-center gap-2 overflow-x-auto">
          {[
            { id: "all", label: "All Bookings", count: bookings.length },
            {
              id: "pending",
              label: "Pending Action",
              count: bookings.filter((b) => b.status?.toLowerCase() === "pending").length,
            },
            {
              id: "accepted",
              label: "In Progress / Accepted",
              count: bookings.filter((b) => b.status?.toLowerCase() === "accepted").length,
            },
            {
              id: "completed",
              label: "Completed",
              count: bookings.filter((b) => b.status?.toLowerCase() === "completed").length,
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

        {/* Bookings Feed */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const customerUser = b.customer?.user || b.user;
              const customerName = customerUser?.name || "Client";
              const isPending = b.status?.toLowerCase() === "pending";
              const isAccepted = b.status?.toLowerCase() === "accepted";

              return (
                <div
                  key={b._id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
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

                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {b.service?.name || "Service Request"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-semibold text-slate-800">{customerName}</span>
                        </div>
                        {customerUser?.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{customerUser.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{formatDate(b.bookingDate || b.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatTime(b.timeSlot)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Revenue & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end sm:items-center lg:items-end justify-between lg:justify-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-xs text-slate-600 block">Earnings Rate</span>
                      <span className="text-xl font-black text-slate-900">
                        ₹{b.amount || b.totalAmount || b.price || 0}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Chat with Customer button */}
                      <Link
                        to={`/provider/chat/${b._id}`}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-white transition-colors"
                        title="Chat with Customer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>

                      {/* Pending Actions: Accept or Reject */}
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAction(b._id, "accept")}
                            disabled={actionLoading === `${b._id}-accept`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAction(b._id, "reject")}
                            disabled={actionLoading === `${b._id}-reject`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      {/* Accepted Actions: Complete */}
                      {isAccepted && (
                        <button
                          type="button"
                          onClick={() => handleAction(b._id, "complete")}
                          disabled={actionLoading === `${b._id}-complete`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm">
            <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Bookings in this Category</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Any client booking requests matching this status will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderBookings;
