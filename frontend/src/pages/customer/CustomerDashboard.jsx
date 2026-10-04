import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Wallet,
  Compass,
  Bell,
  User,
  ArrowRight,
  Sparkles,
  MapPin,
  ChevronRight,
  Wrench,
  AlertCircle,
} from "lucide-react";

const CustomerDashboard = () => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/bookings/");
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error("Dashboard booking error:", err);
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

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status?.toLowerCase() === "pending").length;
  const completedBookings = bookings.filter((b) => b.status?.toLowerCase() === "completed").length;
  const totalSpent = bookings
    .filter((b) => b.status?.toLowerCase() === "completed")
    .reduce((sum, b) => sum + Number(b.totalAmount || b.amount || b.price || 0), 0);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const getStatusBadge = (status) => {
    const s = String(status || "pending").toLowerCase();
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

  if (loading) {
    return <Loading message="Loading customer dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || "Customer"}!
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Track appointments, coordinate with providers, and manage your local services.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all self-start md:self-auto"
          >
            <Compass className="w-4 h-4" />
            <span>Find a Service</span>
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* 4 Metric Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Bookings */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Bookings</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalBookings}</h3>
              <p className="text-[11px] text-slate-600">Lifetime orders</p>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Pending</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{pendingBookings}</h3>
              <p className="text-[11px] text-slate-600">Awaiting confirmation</p>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Completed</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{completedBookings}</h3>
              <p className="text-[11px] text-slate-600">Successfully finished</p>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Spent</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">₹{totalSpent}</h3>
              <p className="text-[11px] text-slate-600">On finished services</p>
            </div>
          </div>
        </div>

        {/* Quick Action Cards Grid */}
        <section>
          <div className="mb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Quick Shortcuts
            </span>
            <h2 className="text-lg font-bold text-slate-900">What would you like to do?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/services"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Explore Services
                  </h3>
                  <p className="text-xs text-slate-600">Find new local pros</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/customer/bookings"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    My Bookings
                  </h3>
                  <p className="text-xs text-slate-600">Manage appointments</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/customer/notifications"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Notifications
                  </h3>
                  <p className="text-xs text-slate-600">Activity & alerts</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/profile"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Account Profile
                  </h3>
                  <p className="text-xs text-slate-600">Settings & details</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </section>

        {/* Recent Bookings List Card */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Recent Activity
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Recent Bookings
              </h2>
            </div>
            <Link
              to="/customer/bookings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>View all bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {b.service?.name || b.serviceName || "Service Booking"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(b.date || b.bookingDate)}
                        {b.timeSlot && ` • ${b.timeSlot?.startTime ? `${b.timeSlot.startTime} - ${b.timeSlot.endTime}` : b.timeSlot}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900 block">
                        ₹{b.totalAmount || b.amount || b.price || 0}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getStatusBadge(
                        b.status,
                      )}`}
                    >
                      {b.status || "Pending"}
                    </span>

                    <Link
                      to={`/customer/bookings/${b._id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-xs font-semibold text-slate-700 transition-colors"
                    >
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Bookings Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-5">
                You haven't placed any bookings yet. Search our catalog of trusted local pros to get started.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20"
              >
                <span>Browse Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CustomerDashboard;
