import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  Users,
  Grid,
  Layers,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/dashboard");
      const data = response.data?.dashboard || response.data;
      setDashboard(data);
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError(
        err.response?.data?.message || "Unable to load administration dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loading message="Loading platform administration data..." />;
  }

  const totalUsers = dashboard?.totalUsers ?? 0;
  const totalCategories = dashboard?.totalCategories ?? 0;
  const totalServices = dashboard?.totalServices ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administration Console</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              SkillConnect Admin Overview
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Oversee platform users, catalog taxonomy, and service listings.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Marketplace Active</span>
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

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-5 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Registered Accounts</p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">{totalUsers}</h3>
              <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
                Manage accounts <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </div>
          </Link>

          <Link
            to="/admin/categories"
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-5 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Grid className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Marketplace Categories</p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">{totalCategories}</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                Manage categories <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </div>
          </Link>

          <Link
            to="/admin/services"
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex items-center gap-5 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Listed Services</p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">{totalServices}</h3>
              <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                Moderate services <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </div>
          </Link>
        </div>

        {/* Administration Modules */}
        <section>
          <div className="mb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Control Panel
            </span>
            <h2 className="text-lg font-bold text-slate-900">Administration Modules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">User Management</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  View customers, service providers, and administrators. Inspect account details or remove abusive accounts.
                </p>
              </div>
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>Launch Users Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Grid className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Category Taxonomy</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Define new categories for the marketplace, edit descriptions, or reorganize how services are categorized.
                </p>
              </div>
              <Link
                to="/admin/categories"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <span>Launch Categories Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Services Moderation</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Monitor all active provider listings, verify compliance with marketplace policies, or delete fraudulent services.
                </p>
              </div>
              <Link
                to="/admin/services"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                <span>Launch Services Moderation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
