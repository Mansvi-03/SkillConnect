import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  Bell,
  Calendar,
  CreditCard,
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Inbox,
} from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/notifications");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.notifications || [];
        setNotifications(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load notifications.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    const val = String(type || "").toLowerCase();
    if (val.includes("booking")) return <Calendar className="w-5 h-5 text-blue-600" />;
    if (val.includes("payment")) return <CreditCard className="w-5 h-5 text-emerald-600" />;
    if (val.includes("review")) return <Star className="w-5 h-5 text-amber-500" />;
    if (val.includes("message")) return <MessageSquare className="w-5 h-5 text-indigo-600" />;
    return <Bell className="w-5 h-5 text-blue-600" />;
  };

  const getIconBg = (type) => {
    const val = String(type || "").toLowerCase();
    if (val.includes("booking")) return "bg-blue-50";
    if (val.includes("payment")) return "bg-emerald-50";
    if (val.includes("review")) return "bg-amber-50";
    if (val.includes("message")) return "bg-indigo-50";
    return "bg-slate-100";
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <Loading message="Loading notifications..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Activity Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Notifications
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Live updates about your bookings, messages, and payments.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
            <Bell className="w-6 h-6" />
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Notifications Feed */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Activity</h2>
            <span className="text-xs font-semibold text-slate-500">
              {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
            </span>
          </div>

          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-5 flex items-start gap-4 transition-colors ${
                    !n.isRead ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl ${getIconBg(
                      n.type,
                    )} flex items-center justify-center shrink-0 shadow-inner mt-0.5`}
                  >
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {n.title || "Notification"}
                      </h3>
                      {!n.isRead && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-600 text-white shadow-xs">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[11px] text-slate-400 block pt-1">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">All Caught Up!</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                You have no new notifications right now. Activity regarding bookings and messages will appear here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
