import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";

const ProviderReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get("/reviews/provider");

        setReviews(response.data.reviews || []);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Customer Reviews</h1>

        <p className="mt-2 text-gray-500">
          See what customers say about your services.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-md">
        <p className="text-gray-500">Average Rating</p>

        <div className="mt-2 flex items-center gap-3">
          <span className="text-4xl font-bold text-gray-800">
            {averageRating}
          </span>

          <span className="text-2xl text-yellow-400">★</span>

          <span className="text-gray-500">({reviews.length} reviews)</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-8 rounded-xl bg-white p-10 text-center shadow-md">
          <div className="text-5xl">⭐</div>

          <h2 className="mt-4 text-xl font-semibold text-gray-700">
            No reviews yet
          </h2>

          <p className="mt-2 text-gray-500">
            Customer reviews will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {reviews.map((review) => (
            <div key={review._id} className="rounded-xl bg-white p-6 shadow-md">
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <h2 className="font-bold text-gray-800">
                    {review.customer?.user?.name ||
                      review.user?.name ||
                      "Customer"}
                  </h2>

                  <p className="mt-1 text-yellow-400">
                    {"★".repeat(review.rating || 0)}
                  </p>
                </div>

                {review.service?.name && (
                  <span className="text-sm text-gray-500">
                    {review.service.name}
                  </span>
                )}
              </div>

              <p className="mt-4 leading-6 text-gray-600">{review.comment}</p>

              {review.createdAt && (
                <p className="mt-3 text-sm text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderReviews;
