import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Wallet,
  PlusCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertCircle,
  User,
} from "lucide-react";

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/provider/dashboard");
      setDashboard(response.data?.dashboard || {});
    } catch (err) {
      console.error("Provider dashboard error:", err);
      setError(
        err.response?.data?.message || "Unable to load provider dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loading message="Loading provider dashboard analytics..." />;
  }

  const totalServices = dashboard?.totalServices ?? 0;
  const totalBookings = dashboard?.totalBookings ?? 0;
  const completedBookings = dashboard?.completedBookings ?? 0;
  const totalEarnings = dashboard?.totalEarnings ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Provider Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Hello, {user?.name || "Professional"}!
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Manage your service catalog, respond to client bookings, and track your revenue.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              to="/provider/services/add"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Service</span>
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
            <button
              onClick={fetchDashboard}
              className="text-xs font-bold text-rose-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* 4 Metric Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Active Services */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Active Services</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalServices}</h3>
              <p className="text-[11px] text-slate-600">Listed on catalog</p>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Bookings</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalBookings}</h3>
              <p className="text-[11px] text-slate-600">Customer requests</p>
            </div>
          </div>

          {/* Completed Jobs */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Completed Jobs</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{completedBookings}</h3>
              <p className="text-[11px] text-slate-600">Fulfilled appointments</p>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Earnings</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">₹{totalEarnings}</h3>
              <p className="text-[11px] text-slate-600">Simulated revenue</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <section>
          <div className="mb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Management
            </span>
            <h2 className="text-lg font-bold text-slate-900">Workspace Navigation</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/provider/services"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    My Services
                  </h3>
                  <p className="text-xs text-slate-600">Edit listings & prices</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/provider/bookings"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Customer Bookings
                  </h3>
                  <p className="text-xs text-slate-600">Accept or complete</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/provider/earnings"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Earnings & Payouts
                  </h3>
                  <p className="text-xs text-slate-600">View payout history</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/profile"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Provider Profile
                  </h3>
                  <p className="text-xs text-slate-600">Bio, city, phone</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProviderDashboard;
