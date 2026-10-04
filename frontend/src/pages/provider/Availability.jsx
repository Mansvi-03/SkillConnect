import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";

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
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load availability.");
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

      setMessage("Availability added successfully.");

      setDate("");
      setStartTime("");
      setEndTime("");

      await fetchAvailability();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to add availability.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (availabilityId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this availability?",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(availabilityId);
    setError("");
    setMessage("");

    try {
      await api.delete(`/availability/${availabilityId}`);

      setAvailability((previous) =>
        previous.filter((item) => item._id !== availabilityId),
      );

      setMessage("Availability deleted successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to delete availability.",
      );
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="availability-page">
      <div className="sc-container">
        {/* Header */}
        <section className="availability-header">
          <p className="availability-eyebrow">Provider Availability</p>

          <h1 className="availability-title">Manage Availability</h1>

          <p className="availability-subtitle">
            Add the dates and time slots when customers can book your service.
          </p>
        </section>

        {/* Messages */}
        {message && (
          <div className="availability-success">
            <span>✓</span>
            {message}
          </div>
        )}

        {error && (
          <div className="availability-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* Add Availability */}
        <section className="availability-form-card">
          <div className="availability-form-header">
            <div className="availability-form-icon">+</div>

            <div>
              <h2>Add Availability</h2>

              <p>Select a date and the time customers can book.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="availability-form">
            <div className="availability-field">
              <label>Date</label>

              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="availability-field">
              <label>Start Time</label>

              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="availability-field">
              <label>End Time</label>

              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="availability-submit-wrapper">
              <button
                type="submit"
                disabled={saving}
                className="availability-submit-button"
              >
                {saving ? "Adding..." : "Add Slot"}
              </button>
            </div>
          </form>
        </section>

        {/* Existing Availability */}
        <section className="availability-list-section">
          <div className="availability-list-header">
            <div>
              <p className="availability-eyebrow">Your Schedule</p>

              <h2>Existing Availability</h2>

              <p>
                {availability.length}{" "}
                {availability.length === 1
                  ? "availability"
                  : "availability slots"}{" "}
                added.
              </p>
            </div>

            <div className="availability-count">{availability.length}</div>
          </div>

          {availability.length === 0 ? (
            <div className="availability-empty">
              <div className="availability-empty-icon">🕐</div>

              <h3>No Availability Yet</h3>

              <p>Add your first available date and time slot above.</p>
            </div>
          ) : (
            <div className="availability-list">
              {availability.map((item) => (
                <article key={item._id} className="availability-card">
                  <div className="availability-card-date">
                    <div className="availability-calendar-icon">📅</div>

                    <div>
                      <span>Available Date</span>

                      <strong>
                        {item.date
                          ? new Date(item.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </strong>
                    </div>
                  </div>

                  <div className="availability-slots">
                    {item.timeSlots?.map((slot, index) => (
                      <div key={index} className="availability-slot">
                        <span>🕐</span>

                        {slot.startTime}
                        {" - "}
                        {slot.endTime}

                        {slot.isBooked && <small>Booked</small>}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    disabled={deleting === item._id}
                    className="availability-delete-button"
                  >
                    {deleting === item._id ? "Deleting..." : "Delete"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Availability;
