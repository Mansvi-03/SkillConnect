import { useEffect, useState } from "react";

import api from "../../services/api";
import Loading from "../../components/Loading";

import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  ArrowRight,
} from "lucide-react";

const Payments = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [payments, setPayments] = useState([]);

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [paying, setPaying] = useState(null);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [paymentsResponse, bookingsResponse] = await Promise.all([
        api.get("/payments"),
        api.get("/bookings"),
      ]);

      setPayments(paymentsResponse.data?.payments || []);

      setBookings(bookingsResponse.data?.bookings || []);
    } catch (err) {
      console.error("FETCH PAYMENT DATA ERROR:", err);

      setError(
        err.response?.data?.message || "Unable to load payment records.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // HANDLE PAYMENT
  // =====================================================

  const handlePayment = async (bookingId) => {
    try {
      setPaying(bookingId);

      setMessage("");
      setError("");

      // -------------------------------------------------
      // CREATE DEMO PAYMENT
      // -------------------------------------------------

      await api.post("/payments", {
        booking: bookingId,

        paymentMethod: "Demo UPI",
      });

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      setMessage(
        "Payment completed successfully! Your transaction has been recorded.",
      );

      // -------------------------------------------------
      // REFRESH DATA
      // -------------------------------------------------

      await fetchData();
    } catch (err) {
      console.error("PAYMENT ERROR:", err);

      setError(err.response?.data?.message || "Payment transaction failed.");
    } finally {
      setPaying(null);
    }
  };

  // =====================================================
  // PAID BOOKING IDS
  // =====================================================

  const paidBookingIds = payments.map((payment) =>
    String(payment.booking?._id || payment.booking),
  );

  // =====================================================
  // UNPAID BOOKINGS
  // =====================================================

  const unpaidBookings = bookings.filter((booking) => {
    const status = booking.status?.toLowerCase();

    const canPay = status === "accepted" || status === "completed";

    const alreadyPaid =
      booking.paymentStatus === "Paid" ||
      paidBookingIds.includes(String(booking._id));

    return canPay && !alreadyPaid;
  });

  // =====================================================
  // TOTAL SETTLED
  // =====================================================

  const totalSettled = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loading message="Loading payment records and invoices..." />;
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Billing & Invoices
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Payments & Receipts
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Settle your service bookings and review your completed payment
            transactions.
          </p>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />

            <p>{message}</p>
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />

            <p>{error}</p>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* PENDING */}

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Pending Settlement
              </p>

              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                {unpaidBookings.length}{" "}
                {unpaidBookings.length === 1 ? "Invoice" : "Invoices"}
              </h3>

              <p className="text-[11px] text-slate-600">Awaiting payment</p>
            </div>
          </div>

          {/* SETTLED */}

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Total Settled
              </p>

              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                ₹{totalSettled.toLocaleString("en-IN")}
              </h3>

              <p className="text-[11px] text-slate-600">
                Across {payments.length} transactions
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            PENDING PAYMENTS
        ================================================= */}

        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Action Required
            </span>

            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Pending Payments
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Pay for accepted or completed service bookings.
            </p>
          </div>

          {unpaidBookings.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />

              <p className="text-sm font-bold text-slate-700">
                All Invoices Settled
              </p>

              <p className="text-xs text-slate-400 mt-0.5">
                You don't have any outstanding payments right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unpaidBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="p-6 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-sm flex flex-col justify-between space-y-4"
                >
                  {/* BOOKING DETAILS */}

                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        {booking.status} Booking
                      </span>

                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {booking.service?.name || "Service Appointment"}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        Scheduled on{" "}
                        {booking.bookingDate
                          ? new Date(booking.bookingDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "Date N/A"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-600 block">Due</span>

                      <span className="text-2xl font-black text-slate-900">
                        ₹{Number(booking.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* PAYMENT BUTTON */}

                  <button
                    type="button"
                    onClick={() => handlePayment(booking._id)}
                    disabled={paying === booking._id}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {paying === booking._id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />

                        <span>Pay Now (Demo UPI)</span>

                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            PAYMENT HISTORY
        ================================================= */}

        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Ledger
            </span>

            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Payment History
            </h2>
          </div>

          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-3" />

              <p className="text-sm font-semibold text-slate-600">
                No previous payment transactions found.
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Your successful payments will appear here.
              </p>
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

                    <th className="px-6 py-4">Transaction</th>

                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {payment.booking?.service?.name ||
                          "Service Appointment"}
                      </td>

                      <td className="px-6 py-4 font-extrabold text-emerald-600">
                        ₹{Number(payment.amount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {payment.paymentMethod || "Demo Payment"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />

                          {payment.status || "Success"}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                        {payment.transactionId || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString("en-IN")
                          : payment.createdAt
                            ? new Date(payment.createdAt).toLocaleDateString(
                                "en-IN",
                              )
                            : "N/A"}
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
