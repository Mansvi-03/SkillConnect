import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";

const BookService = () => {
  const { id } = useParams();
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

  // =====================================================
  // FETCH SERVICE
  // =====================================================

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await api.get(`/services/${id}`);

        setService(response.data.service);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load service.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // =====================================================
  // CHECK AVAILABILITY
  // =====================================================

  const handleCheckAvailability = async () => {
    if (!date) {
      setError("Please select a booking date.");
      return;
    }

    setError("");
    setMessage("");
    setSelectedSlot(null);
    setAvailableSlots([]);
    setChecking(true);

    try {
      const response = await api.get(
        `/availability/check?serviceId=${id}&date=${date}`,
      );

      const slots = response.data.availableSlots || [];

      setAvailableSlots(slots);

      if (slots.length === 0) {
        setMessage("No available slots found for this date.");
      } else {
        setMessage(
          `${slots.length} slot${slots.length > 1 ? "s" : ""} available.`,
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to check availability.",
      );
    } finally {
      setChecking(false);
    }
  };

  // =====================================================
  // CONFIRM BOOKING
  // =====================================================

  const handleConfirmBooking = async () => {
    if (!date) {
      setError("Please select a booking date.");
      return;
    }

    if (!selectedSlot) {
      setError("Please select an available time slot.");
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

      setMessage("Booking created successfully.");

      setTimeout(() => {
        navigate("/customer/bookings");
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to create booking.");
    } finally {
      setBooking(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loading />;
  }

  // =====================================================
  // SERVICE LOAD ERROR
  // =====================================================

  if (error && !service) {
    return (
      <div className="book-service-page">
        <div className="sc-container">
          <div className="book-service-error-page">
            <div className="book-service-error-icon">!</div>

            <h2>Unable to load service</h2>

            <p>{error}</p>

            <Link to="/services" className="book-service-back-button">
              Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // SERVICE NOT FOUND
  // =====================================================

  if (!service) {
    return (
      <div className="book-service-page">
        <div className="sc-container">
          <div className="book-service-error-page">
            <div className="book-service-error-icon">?</div>

            <h2>Service not found</h2>

            <p>The service you're looking for does not exist.</p>

            <Link to="/services" className="book-service-back-button">
              Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="book-service-page">
      {/* =================================================
          HEADER
      ================================================== */}

      <section className="book-service-header">
        <div className="sc-container">
          <Link to={`/services/${service._id}`} className="book-service-back">
            ← Back to Service
          </Link>

          <div className="book-service-header-content">
            <span className="book-service-eyebrow">Booking</span>

            <h1 className="book-service-title">Book a Service</h1>

            <p className="book-service-subtitle">
              Select your preferred date and available time slot.
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================== */}

      <section className="book-service-content">
        <div className="sc-container">
          <div className="book-service-layout">
            {/* =================================================
                LEFT SIDE
            ================================================== */}

            <div className="book-service-left">
              {/* SERVICE CARD */}

              <div className="booking-service-card">
                <div className="booking-service-card-header">
                  <span className="booking-service-icon">🛠️</span>

                  <div>
                    <span className="booking-service-label">
                      Selected Service
                    </span>

                    <h2>{service.name}</h2>
                  </div>
                </div>

                <div className="booking-service-divider" />

                <p className="booking-service-description">
                  {service.description ||
                    "No description available for this service."}
                </p>

                <div className="booking-service-info">
                  {/* PRICE */}

                  <div className="booking-service-info-item">
                    <span>💰</span>

                    <div>
                      <small>Price</small>

                      <strong>₹{service.price}</strong>
                    </div>
                  </div>

                  {/* LOCATION */}

                  <div className="booking-service-info-item">
                    <span>📍</span>

                    <div>
                      <small>Location</small>

                      <strong>{service.location || "N/A"}</strong>
                    </div>
                  </div>

                  {/* RATING */}

                  <div className="booking-service-info-item">
                    <span>⭐</span>

                    <div>
                      <small>Rating</small>

                      <strong>{service.averageRating || 0}</strong>
                    </div>
                  </div>

                  {/* CATEGORY */}

                  <div className="booking-service-info-item">
                    <span>📂</span>

                    <div>
                      <small>Category</small>

                      <strong>{service.category?.name || "N/A"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  PROVIDER CARD
              ================================================== */}

              <div className="booking-provider-card">
                <div className="booking-provider-avatar">
                  {service.provider?.user?.name
                    ? service.provider.user.name.charAt(0).toUpperCase()
                    : "P"}
                </div>

                <div className="booking-provider-info">
                  <span>Service Provider</span>

                  <h3>{service.provider?.user?.name || "Provider"}</h3>

                  <p>
                    {service.provider?.user?.email || "Provider information"}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================== */}

            <div className="book-service-right">
              <div className="booking-form-card">
                {/* =================================================
                    STEP 1
                ================================================== */}

                <div className="booking-form-header">
                  <span className="booking-form-number">01</span>

                  <div>
                    <span>STEP 1</span>

                    <h2>Select Date</h2>
                  </div>
                </div>

                {/* DATE */}

                <div className="booking-date-section">
                  <label htmlFor="booking-date">Booking Date</label>

                  <input
                    id="booking-date"
                    type="date"
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(event) => {
                      setDate(event.target.value);
                      setAvailableSlots([]);
                      setSelectedSlot(null);
                      setMessage("");
                      setError("");
                    }}
                  />

                  <p className="booking-field-help">
                    Choose a date to see available time slots.
                  </p>
                </div>

                {/* CHECK AVAILABILITY */}

                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={checking || !date}
                  className="booking-check-button"
                >
                  {checking ? "Checking..." : "Check Available Slots"}
                </button>

                {/* =================================================
                    STEP 2 - SLOTS
                ================================================== */}

                {availableSlots.length > 0 && (
                  <div className="booking-slots-section">
                    <div className="booking-slots-header">
                      <div>
                        <span>STEP 2</span>

                        <h3>Select Time Slot</h3>
                      </div>

                      <span className="booking-slot-count">
                        {availableSlots.length}{" "}
                        {availableSlots.length === 1
                          ? "available"
                          : "available"}
                      </span>
                    </div>

                    <div className="booking-slots-grid">
                      {availableSlots.map((slot, index) => {
                        const isSelected = selectedSlot === slot;

                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={slot.isBooked}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setError("");
                              setMessage("");
                            }}
                            className={`booking-slot ${
                              isSelected ? "booking-slot-selected" : ""
                            } ${slot.isBooked ? "booking-slot-booked" : ""}`}
                          >
                            <span className="booking-slot-icon">🕐</span>

                            <span className="booking-slot-time">
                              {slot.startTime}
                              {" - "}
                              {slot.endTime}
                            </span>

                            {isSelected && (
                              <span className="booking-slot-check">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* =================================================
                    NO SLOTS
                ================================================== */}

                {message && availableSlots.length === 0 && (
                  <div className="booking-no-slots">
                    <span>📅</span>

                    <div>
                      <strong>No slots available</strong>

                      <p>Try selecting another date.</p>
                    </div>
                  </div>
                )}

                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                  <div className="booking-error">
                    <span>!</span>

                    {error}
                  </div>
                )}

                {/* =================================================
                    SUCCESS
                ================================================== */}

                {message && availableSlots.length > 0 && !selectedSlot && (
                  <div className="booking-success">✓ {message}</div>
                )}

                {/* =================================================
                    STEP 3 - SUMMARY
                ================================================== */}

                {selectedSlot && (
                  <div className="booking-summary">
                    <div className="booking-summary-header">
                      <span>STEP 3</span>

                      <h3>Booking Summary</h3>
                    </div>

                    <div className="booking-summary-row">
                      <span>Service</span>

                      <strong>{service.name}</strong>
                    </div>

                    <div className="booking-summary-row">
                      <span>Date</span>

                      <strong>{date}</strong>
                    </div>

                    <div className="booking-summary-row">
                      <span>Time</span>

                      <strong>
                        {selectedSlot.startTime}
                        {" - "}
                        {selectedSlot.endTime}
                      </strong>
                    </div>

                    <div className="booking-summary-total">
                      <span>Total</span>

                      <strong>₹{service.price}</strong>
                    </div>

                    {/* CONFIRM */}

                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={booking}
                      className="booking-confirm-button"
                    >
                      {booking ? "Confirming Booking..." : "Confirm Booking"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookService;
