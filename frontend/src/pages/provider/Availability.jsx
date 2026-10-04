import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const Availability = () => {
  const { serviceId } = useParams();

  const [availability, setAvailability] = useState([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchAvailability = async () => {
    try {
      setError("");
      const response = await api.get(`/availability/service/${serviceId}`);
      setAvailability(response.data.availability || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load availability slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (startTime >= endTime) {
      setError("End time must be later than start time.");
      return;
    }

    setSaving(true);

    try {
      await api.post("/availability", {
        service: serviceId,
        date,
        timeSlots: [
          {
            startTime,
            endTime,
            isBooked: false,
          },
        ],
      });

      setMessage("Time slot added successfully!");
      setDate("");
      setStartTime("");
      setEndTime("");
      await fetchAvailability();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add availability slot.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (availabilityId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this availability slot?",
    );
    if (!confirmed) return;

    setDeleting(availabilityId);
    setError("");
    setMessage("");

    try {
      await api.delete(`/availability/${availabilityId}`);
      setAvailability((prev) => prev.filter((item) => item._id !== availabilityId));
      setMessage("Time slot removed.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete availability slot.");
    } finally {
      setDeleting(null);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  if (loading) {
    return <Loading message="Loading schedule and slot hours..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/provider/services"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Services</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Booking Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Manage Availability Slots
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Define available appointment windows so customers can book this service.
          </p>
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

        {/* Add Slot Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Add Open Time Slot</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Start Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                End Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Save Slot to Schedule</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Slots List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Current Active Slots</h2>
            <span className="text-xs font-semibold text-slate-500">
              {availability.length} {availability.length === 1 ? "Slot" : "Slots"} Scheduled
            </span>
          </div>

          {availability.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No availability slots configured yet. Add your open hours above.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {availability.map((item) => (
                <div
                  key={item._id}
                  className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {item.date ? new Date(item.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) : "Recurring"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        {item.timeSlots?.map((ts, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md font-semibold ${
                              ts.isBooked
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {ts.startTime} - {ts.endTime} {ts.isBooked && "(Booked)"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    disabled={deleting === item._id}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    title="Delete Time Slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Availability;
