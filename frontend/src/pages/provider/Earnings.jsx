import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";
import Loading from "../../components/Loading";

import {
  Wallet,
  Receipt,
  TrendingUp,
  AlertCircle,
  Calendar,
  User,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const Earnings = () => {
  const [payments, setPayments] = useState([]);

  const [summary, setSummary] = useState({
    totalEarnings: 0,
    completedPayments: 0,
    averagePerJob: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // FETCH EARNINGS
  // =====================================================

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError("");

      // Provider payments
      const response = await api.get("/payments");

      setPayments(response.data?.payments || []);

      setSummary(
        response.data?.summary || {
          totalEarnings: 0,
          completedPayments: 0,
          averagePerJob: 0,
        },
      );
    } catch (err) {
      console.error("FETCH EARNINGS ERROR:", err);

      setError(err.response?.data?.message || "Unable to load earnings.");

      setPayments([]);

      setSummary({
        totalEarnings: 0,
        completedPayments: 0,
        averagePerJob: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loading message="Loading your earnings..." />;
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Financial Ledger
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                Earnings & Payouts
              </h1>

              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                Track your successful customer payments and service revenue.
              </p>
            </div>

            <Link
              to="/provider/dashboard"
              className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />

              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={fetchEarnings}
              className="font-bold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* TOTAL EARNINGS */}

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Total Net Earnings
                </p>

                <h2 className="text-3xl font-black text-emerald-600 mt-2">
                  ₹{Number(summary.totalEarnings || 0).toLocaleString("en-IN")}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  From successful customer payments
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* COMPLETED PAYMENTS */}

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Successful Payments
                </p>

                <h2 className="text-3xl font-black text-blue-600 mt-2">
                  {summary.completedPayments || 0}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Paid service transactions
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* AVERAGE */}

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Average / Job
                </p>

                <h2 className="text-3xl font-black text-indigo-600 mt-2">
                  ₹{Number(summary.averagePerJob || 0).toLocaleString("en-IN")}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Average successful payment
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            PAYMENT HISTORY
        ================================================= */}

        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* HEADER */}

          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Payout Records
              </span>

              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Payment History
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Every successful customer payment received for your services.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
              {payments.length} {payments.length === 1 ? "Payment" : "Payments"}
            </span>
          </div>

          {/* =================================================
              NO PAYMENTS
          ================================================= */}

          {payments.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-slate-800">
                No earnings yet
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2">
                No successful customer payments have been recorded for your
                services yet.
              </p>

              <Link
                to="/provider/bookings"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                View Bookings
              </Link>
            </div>
          ) : (
            /* =================================================
               PAYMENT LIST
            ================================================= */

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Service
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Booking
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => {
                    const serviceName =
                      payment.booking?.service?.name || "Service";

                    const customerName =
                      payment.booking?.customer?.user?.name ||
                      payment.customer?.user?.name ||
                      "Customer";

                    const bookingDate = payment.booking?.bookingDate;

                    return (
                      <tr
                        key={payment._id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* SERVICE */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <CreditCard className="w-5 h-5" />
                            </div>

                            <div>
                              <p className="font-bold text-sm text-slate-900">
                                {serviceName}
                              </p>

                              <p className="text-[11px] text-slate-500">
                                Service transaction
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CUSTOMER */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                              {customerName.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {customerName}
                              </p>

                              {payment.customer?.user?.email && (
                                <p className="text-[11px] text-slate-500">
                                  {payment.customer.user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* BOOKING */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />

                            <span className="text-xs">
                              {bookingDate
                                ? new Date(bookingDate).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* AMOUNT */}

                        <td className="px-6 py-5">
                          <span className="text-base font-black text-emerald-600">
                            ₹
                            {Number(payment.amount || 0).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </td>

                        {/* PAYMENT STATUS */}

                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />

                            {payment.status || "Success"}
                          </span>

                          {payment.transactionId && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              {payment.transactionId}
                            </p>
                          )}
                        </td>

                        {/* PAYMENT DATE */}

                        <td className="px-6 py-5">
                          <p className="text-xs text-slate-600">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString(
                                  "en-IN",
                                )
                              : payment.createdAt
                                ? new Date(
                                    payment.createdAt,
                                  ).toLocaleDateString("en-IN")
                                : "N/A"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Earnings;
