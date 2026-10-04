import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  CalendarCheck,
} from "lucide-react";

const BookService = () => {
  const params = useParams();
  const targetId = params.serviceId || params.id;
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/services/${targetId}`);
        setService(response.data.service);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load service.");
      } finally {
        setLoading(false);
      }
    };

    if (targetId) {
      fetchService();
    }
  }, [targetId]);

  const handleCheckAvailability = async (selectedDate = date) => {
    if (!selectedDate) {
      setError("Please select a booking date first.");
      return;
    }

    setError("");
    setMessage("");
    setSelectedSlot(null);
    setAvailableSlots([]);
    setChecking(true);

    try {
      const response = await api.get(
        `/availability/check?serviceId=${targetId}&date=${selectedDate}`,
      );
      const slots = response.data.availableSlots || [];
      setAvailableSlots(slots);

      if (slots.length === 0) {
        setMessage("No available slots found for this date. Please try another day.");
      } else {
        setMessage(`${slots.length} available time slot${slots.length > 1 ? "s" : ""} found!`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to check availability.",
      );
    } finally {
      setChecking(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    if (newDate) {
      handleCheckAvailability(newDate);
    }
  };

  const handleConfirmBooking = async () => {
    if (!date) {
      setError("Please select a date for your service.");
      return;
    }

    if (!selectedSlot) {
      setError("Please pick an available time slot.");
      return;
    }

    setError("");
    setMessage("");
    setBooking(true);

    try {
      await api.post("/bookings", {
        service: service._id,
        bookingDate: date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      setMessage("Booking submitted successfully! Directing to your bookings...");
      setTimeout(() => {
        navigate("/customer/bookings");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to complete booking.");
      setBooking(false);
    }
  };

  if (loading) {
    return <Loading message="Loading booking options..." />;
  }

  if (!service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900">Service Not Found</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            The service you're trying to book is no longer available.
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services</span>
          </Link>
        </div>
      </div>
    );
  }

  // Today's date in YYYY-MM-DD for min date
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={`/services/${service._id}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Service Details</span>
          </Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Step-by-Step Scheduling
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Book Appointment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Select a convenient date and time to schedule your appointment with {service.provider?.user?.name || "the provider"}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Date & Slot Selection */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Date */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Choose a Date</h2>
                  <p className="text-xs text-slate-500">Pick any available upcoming day</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={handleDateChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Available Slots */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Select Time Slot</h2>
                  <p className="text-xs text-slate-500">Choose an open slot from provider's schedule</p>
                </div>
              </div>

              {/* Status / Feedback message */}
              {checking && (
                <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  <span>Checking open time slots...</span>
                </div>
              )}

              {!checking && message && (
                <div className="p-3 mb-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {!checking && error && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!checking && !date && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Please choose a date above to display available appointment slots.
                </div>
              )}

              {!checking && date && availableSlots.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableSlots.map((slot, index) => {
                    const isSelected =
                      selectedSlot?.startTime === slot.startTime &&
                      selectedSlot?.endTime === slot.endTime;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                            : "bg-slate-50 hover:bg-white text-slate-700 border-slate-200/80 hover:border-blue-400"
                        }`}
                      >
                        <Clock className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-400"}`} />
                        <span className="text-xs font-bold">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className={`text-[10px] ${isSelected ? "text-blue-100" : "text-emerald-600 font-semibold"}`}>
                          Available
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Confirmation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg space-y-5">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Booking Summary
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-slate-900 text-right max-w-[180px]">
                    {service.name}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Provider:</span>
                  <span className="font-semibold text-slate-800">
                    {service.provider?.user?.name || "Local Pro"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-semibold text-slate-800">
                    {date ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Time Slot:</span>
                  <span className="font-semibold text-blue-600">
                    {selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : "Not selected"}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="font-bold text-slate-700">Estimated Total:</span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{service.price ?? 0}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Simulated payment will be completed after provider acceptance.</span>
              </div>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={booking || !date || !selectedSlot}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4" />
                    <span>Confirm & Submit Booking</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookService;
