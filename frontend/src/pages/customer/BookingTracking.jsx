import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Clock3,
  XCircle,
  ShieldCheck,
  CreditCard,
  Star,
  User,
  Phone,
  Mail,
  Wrench,
  AlertCircle,
} from "lucide-react";

const BookingTracking = () => {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");
        if (!bookingId) {
          setError("Booking ID is required.");
          return;
        }
        const response = await api.get(`/bookings/${bookingId}`);
        setBooking(response.data.booking);
      } catch (err) {
        console.error("Fetch booking error:", err);
        setError(
          err.response?.data?.message || "Unable to retrieve booking details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return <Loading message="Loading booking tracking progress..." />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Booking Not Found</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            {error || "We could not find records for this booking ID."}
          </p>
          <Link
            to="/customer/bookings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Bookings</span>
          </Link>
        </div>
      </div>
    );
  }

  const status = (booking.status || "Pending").toLowerCase();
  const isPending = status === "pending";
  const isAccepted = status === "accepted";
  const isCompleted = status === "completed";
  const isRejected = status === "rejected";
  const isCancelled = status === "cancelled";

  const providerUser = booking.provider?.user || booking.provider;
  const providerName = providerUser?.name || "Local Service Provider";
  const bookingDate = booking.bookingDate || booking.date;
  const startTime = booking.timeSlot?.startTime || "";
  const endTime = booking.timeSlot?.endTime || "";
  const amount = booking.amount || booking.totalAmount || 0;

  const formatDate = (d) => {
    if (!d) return "Pending";
    return new Date(d).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Tracking steps definition
  const steps = [
    {
      title: "Booking Requested",
      desc: "Order placed and sent to service provider",
      completed: true,
      current: isPending,
    },
    {
      title: "Confirmed by Provider",
      desc: "Provider accepted appointment schedule",
      completed: isAccepted || isCompleted,
      current: isAccepted,
    },
    {
      title: "Service Completed",
      desc: "Work finished and ready for review",
      completed: isCompleted,
      current: isCompleted,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/customer/bookings"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Bookings</span>
          </Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Tracking Order
              </span>
              <span className="text-xs text-slate-600 font-mono">
                #{booking._id?.slice(-8)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {booking.service?.name || "Service Appointment"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Placed on {new Date(booking.createdAt || Date.now()).toLocaleDateString("en-IN")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider border ${
                isCompleted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isAccepted
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : isPending
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {booking.status}
            </span>

            <Link
              to={`/customer/chat/${booking._id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Live Chat</span>
            </Link>
          </div>
        </div>

        {/* Status Timeline Card */}
        {!isRejected && !isCancelled && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-6">
              Appointment Progress
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {steps.map((st, i) => (
                <div key={i} className="flex md:flex-col items-start gap-4 relative">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      st.completed
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {st.completed ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancellation / Rejection Banner if any */}
        {(isRejected || isCancelled) && (
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-4">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold">This Booking Was {booking.status}</h3>
              <p className="text-xs sm:text-sm mt-1 text-rose-700">
                This service appointment cannot proceed. Please browse our catalog to book another available provider.
              </p>
              <Link
                to="/services"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Browse Alternative Services
              </Link>
            </div>
          </div>
        )}

        {/* Grid: Booking Specs & Provider Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appointment Specs Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Schedule Details
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Date
                </span>
                <span className="font-semibold text-slate-800">
                  {formatDate(bookingDate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Time Window
                </span>
                <span className="font-semibold text-blue-600">
                  {startTime && endTime ? `${startTime} - ${endTime}` : "Flexible"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" /> Total Fee
                </span>
                <span className="text-xl font-black text-slate-900">
                  ₹{amount}
                </span>
              </div>
            </div>

            {isCompleted && (
              <div className="pt-4 border-t border-slate-100">
                <Link
                  to={`/customer/reviews/${booking._id}`}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Star className="w-4 h-4" />
                  <span>Leave a Review & Rating</span>
                </Link>
              </div>
            )}
          </div>

          {/* Provider Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Assigned Professional
            </h3>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center">
                {providerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{providerName}</h4>
                <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Professional</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-600">
              {providerUser?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{providerUser.phone}</span>
                </div>
              )}
              {providerUser?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{providerUser.email}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                to={`/customer/chat/${booking._id}`}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send In-App Message</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingTracking;
