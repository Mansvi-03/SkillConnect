import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";

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
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load payment information.",
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

      setMessage("Payment completed successfully.");

      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Payment failed.");
    } finally {
      setPaying(null);
    }
  };

  const paidBookingIds = payments.map((payment) =>
    String(payment.booking?._id || payment.booking),
  );

  const unpaidBookings = bookings.filter(
    (booking) =>
      ["accepted", "completed"].includes(booking.status) &&
      !paidBookingIds.includes(String(booking._id)),
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Payments</h1>

        <p className="mt-2 text-gray-500">
          Manage your simulated payments and payment history.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Pending Payments */}

      <section>
        <h2 className="text-2xl font-bold text-gray-800">Payments Required</h2>

        {unpaidBookings.length === 0 ? (
          <div className="mt-4 rounded-xl bg-white p-6 text-gray-500 shadow-md">
            No pending payments.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            {unpaidBookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-xl bg-white p-6 shadow-md"
              >
                <h3 className="text-xl font-bold text-gray-800">
                  {booking.service?.name || "Service"}
                </h3>

                <p className="mt-3 text-gray-600">
                  Booking Date:{" "}
                  {booking.date
                    ? new Date(booking.date).toLocaleDateString()
                    : "N/A"}
                </p>

                <p className="mt-2 text-lg font-bold text-blue-600">
                  Amount: ₹{booking.amount || 0}
                </p>

                <button
                  onClick={() => handlePayment(booking._id)}
                  disabled={paying === booking._id}
                  className="mt-5 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {paying === booking._id ? "Processing..." : "Pay Now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Payment History */}

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800">Payment History</h2>

        {payments.length === 0 ? (
          <div className="mt-4 rounded-xl bg-white p-6 text-gray-500 shadow-md">
            No payment history available.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-md">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left">Service</th>

                  <th className="px-6 py-4 text-left">Amount</th>

                  <th className="px-6 py-4 text-left">Method</th>

                  <th className="px-6 py-4 text-left">Status</th>

                  <th className="px-6 py-4 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-t">
                    <td className="px-6 py-4">
                      {payment.booking?.service?.name || "Service"}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      ₹{payment.amount || 0}
                    </td>

                    <td className="px-6 py-4 capitalize">
                      {payment.paymentMethod || "Simulated"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        {payment.status || "success"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Payments;
