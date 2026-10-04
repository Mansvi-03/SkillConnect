import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  Star,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  User,
  Send,
  Calendar,
} from "lucide-react";

const Reviews = () => {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const bookingResponse = await api.get(`/bookings/${bookingId}`);
        const bookingData = bookingResponse.data?.booking;
        setBooking(bookingData);

        const serviceId = bookingData?.service?._id || bookingData?.service;
        if (serviceId) {
          const reviewResponse = await api.get(`/reviews/service/${serviceId}`);
          setReviews(reviewResponse.data?.reviews || []);
        }
      } catch (err) {
        console.error("Fetch review info error:", err);
        setError(
          err.response?.data?.message || "Unable to load review information.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!rating) {
      setError("Please select a star rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter your review feedback.");
      return;
    }

    if (booking?.status?.toLowerCase() !== "completed") {
      setError("You can submit a review only after the service is marked completed.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/reviews", {
        bookingId,
        rating,
        comment: comment.trim(),
      });

      setMessage("Thank you! Your review has been submitted successfully.");
      setComment("");
      setRating(5);
      setHoverRating(0);

      // Reload reviews
      const serviceId = booking?.service?._id || booking?.service;
      if (serviceId) {
        const reviewResponse = await api.get(`/reviews/service/${serviceId}`);
        setReviews(reviewResponse.data?.reviews || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading review panel..." />;
  }

  const isCompleted = booking?.status?.toLowerCase() === "completed";

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
            <span>Back to My Bookings</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Service Header Info */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Feedback & Ratings
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Review Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Service: <strong className="text-slate-800">{booking?.service?.name || "Service Appointment"}</strong>
            </p>
          </div>

          <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 capitalize border border-slate-200">
            Status: {booking?.status || "Pending"}
          </span>
        </div>

        {/* Feedback Messages */}
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

        {/* Review Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          {!isCompleted ? (
            <div className="p-8 text-center bg-amber-50/50 rounded-2xl border border-amber-200/70 text-amber-900">
              <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h3 className="text-base font-bold">Review Locked</h3>
              <p className="text-xs sm:text-sm text-amber-700 mt-1 max-w-sm mx-auto">
                You can write a review once this service has been fully completed by your provider.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            active
                              ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                              : "text-slate-200"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-sm font-bold text-slate-700 ml-2">
                    {hoverRating || rating} out of 5 stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Written Review
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience: punctuality, work quality, professionalism..."
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post Public Review</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Existing Reviews for this Service */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Past Customer Reviews</h2>
              <p className="text-xs text-slate-500">Verified feedback from other clients</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {reviews.length} Total
            </span>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No reviews recorded for this service yet. Be the first to review!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {r.user?.name ? r.user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {r.user?.name || "Customer"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= (r.rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    "{r.comment}"
                  </p>

                  <span className="text-[11px] text-slate-400 block pt-1">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Reviews;
