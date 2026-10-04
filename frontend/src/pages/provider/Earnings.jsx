import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";

import {
  Wallet,
  Receipt,
  TrendingUp,
  AlertCircle,
  Calendar,
  User,
  CheckCircle2,
} from "lucide-react";

const Earnings = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH PROVIDER PAYMENTS
  // =====================================================

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        setError("");

        // The backend automatically filters payments
        // according to the logged-in provider.
        const response = await api.get("/payments");

        setPayments(response.data?.payments || []);
      } catch (err) {
        console.error("EARNINGS ERROR:", err);

        setError(
          err.response?.data?.message || "Unable to load earnings records.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loading message="Calculating your earnings & receipts..." />;
  }

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const totalEarnings = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const avgPerJob =
    payments.length > 0 ? Math.round(totalEarnings / payments.length) : 0;

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // GET SERVICE NAME
  // =====================================================

  const getServiceName = (payment) => {
    return payment.booking?.service?.name || "Service Appointment";
  };

  // =====================================================
  // GET CUSTOMER NAME
  // =====================================================

  const getCustomerName = (payment) => {
    return (
      payment.booking?.customer?.user?.name ||
      payment.customer?.user?.name ||
      payment.booking?.customer?.name ||
      "Customer Client"
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Financial Ledger
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Earnings & Payouts
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Track all completed service transactions and monitor your business
            revenue.
          </p>
        </div>
      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* TOTAL EARNINGS */}

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Total Net Earnings
              </p>

              <h3 className="text-3xl font-black text-emerald-600 mt-0.5">
                ₹{totalEarnings}
              </h3>

              <p className="text-[11px] text-slate-600">All settled bookings</p>
            </div>
          </div>

          {/* COMPLETED PAYMENTS */}

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Completed Payments
              </p>

              <h3 className="text-3xl font-black text-slate-900 mt-0.5">
                {payments.length}
              </h3>

              <p className="text-[11px] text-slate-600">Processed invoices</p>
            </div>
          </div>

          {/* AVERAGE */}

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Average / Job
              </p>

              <h3 className="text-3xl font-black text-slate-900 mt-0.5">
                ₹{avgPerJob}
              </h3>

              <p className="text-[11px] text-slate-600">
                Mean revenue per client
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            PAYMENT HISTORY
        ================================================= */}

        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* HEADER */}

          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Payout Records
              </span>

              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Payment History
              </h2>
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {payments.length} Total
            </span>
          </div>

          {/* EMPTY STATE */}

          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                <Wallet className="w-7 h-7" />
              </div>

              <h3 className="text-sm font-bold text-slate-700">
                No earnings yet
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                No revenue transactions have been recorded yet.
              </p>

              <p className="text-xs text-slate-400">
                Complete customer bookings to start earning.
              </p>
            </div>
          ) : (
            /* =================================================
               TABLE
            ================================================= */

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Service</th>

                    <th className="px-6 py-4">Customer</th>

                    <th className="px-6 py-4">Amount</th>

                    <th className="px-6 py-4">Status</th>

                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* SERVICE */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Receipt className="w-4 h-4" />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {getServiceName(payment)}
                            </p>

                            {payment.booking?.service?.location && (
                              <p className="text-[11px] text-slate-400">
                                {payment.booking.service.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CUSTOMER */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>

                          <span className="text-slate-700">
                            {getCustomerName(payment)}
                          </span>
                        </div>
                      </td>

                      {/* AMOUNT */}

                      <td className="px-6 py-4 font-black text-emerald-600">
                        ₹{Number(payment.amount || 0)}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />

                          {payment.status || "Success"}
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />

                          {formatDate(payment.paidAt || payment.createdAt)}
                        </div>
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

export default Earnings;
