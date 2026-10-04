import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";

const Earnings = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await api.get("/payments/provider-earnings");

        setPayments(response.data.payments || []);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load earnings.");
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const totalEarnings = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Earnings</h1>

        <p className="mt-2 text-gray-500">
          Track your service earnings and completed payments.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-md">
        <p className="text-gray-500">Total Earnings</p>

        <h2 className="mt-2 text-4xl font-bold text-green-600">
          ₹{totalEarnings}
        </h2>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800">Payment History</h2>

        {payments.length === 0 ? (
          <div className="mt-4 rounded-xl bg-white p-8 text-center text-gray-500 shadow-md">
            No earnings available yet.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-md">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left">Service</th>

                  <th className="px-6 py-4 text-left">Customer</th>

                  <th className="px-6 py-4 text-left">Amount</th>

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

                    <td className="px-6 py-4">
                      {payment.booking?.customer?.user?.name ||
                        payment.booking?.user?.name ||
                        "Customer"}
                    </td>

                    <td className="px-6 py-4 font-semibold text-green-600">
                      ₹{payment.amount || 0}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        {payment.status || "success"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500">
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
      </div>
    </div>
  );
};

export default Earnings;
