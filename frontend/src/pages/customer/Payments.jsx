import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [paymentsResponse, bookingsResponse] = await Promise.all([
        api.get("/payments/my-payments"),
        api.get("/bookings/my-bookings"),
      ]);

      setPayments(paymentsResponse.data.payments || []);
      setBookings(bookingsResponse.data.bookings || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load payment records.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayment = async (bookingId) => {
    setPaying(bookingId);
    setMessage("");
    setError("");

    try {
      await api.post("/payments", {
        bookingId,
        paymentMethod: "simulated",
      });

      setMessage("Payment completed successfully! Transaction settled.");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Payment transaction failed.");
    } finally {
      setPaying(null);
    }
  };

  const paidBookingIds = payments.map((payment) =>
    String(payment.booking?._id || payment.booking),
  );

  const unpaidBookings = bookings.filter(
    (booking) =>
      ["accepted", "completed"].includes(booking.status?.toLowerCase()) &&
      !paidBookingIds.includes(String(booking._id)),
  );

  const totalSettled = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0,
  );

  if (loading) {
    return <Loading message="Loading payment records and invoices..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Billing & Invoices
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Payments & Receipts
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 max-w-xl">
            Settle active bookings and review detailed records of all completed transactions.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Messages */}
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

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Pending Settlement</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{unpaidBookings.length} Invoices</h3>
              <p className="text-[11px] text-slate-600">Awaiting payment</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Settled</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">₹{totalSettled}</h3>
              <p className="text-[11px] text-slate-600">Across {payments.length} transactions</p>
            </div>
          </div>
        </div>

        {/* Pending Invoices Section */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Action Required
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">Pending Payments</h2>
          </div>

          {unpaidBookings.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">All Invoices Settled</p>
              <p className="text-xs text-slate-400 mt-0.5">You don't have any outstanding payments right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unpaidBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-6 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        {b.status} Booking
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {b.service?.name || "Service Appointment"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Scheduled on {b.date || b.bookingDate ? new Date(b.date || b.bookingDate).toLocaleDateString() : "Date N/A"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-600 block">Due</span>
                      <span className="text-2xl font-black text-slate-900">
                        ₹{b.amount || b.totalAmount || 0}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePayment(b._id)}
                    disabled={paying === b._id}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {paying === b._id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pay Now (Simulated)</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Payment History Table */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Ledger
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">Payment History</h2>
          </div>

          {payments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No previous payment transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {p.booking?.service?.name || "Service Appointment"}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-emerald-600">
                        ₹{p.amount || 0}
                      </td>
                      <td className="px-6 py-4 text-slate-600 capitalize">
                        {p.paymentMethod || "Simulated"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status || "Completed"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Payments;
