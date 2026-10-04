import { useEffect, useRef, useState } from "react";

import { useParams, Link } from "react-router-dom";

import { io } from "socket.io-client";

import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";

const SOCKET_URL = "http://localhost:5000";

const Chat = () => {
  const { user } = useAuth();

  const { bookingId } = useParams();

  const socketRef = useRef(null);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);

  const [booking, setBooking] = useState(null);

  const [service, setService] = useState(null);

  const [customer, setCustomer] = useState(null);

  const [provider, setProvider] = useState(null);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [socketConnected, setSocketConnected] = useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const currentUserId = user?._id || user?.id;

  /* =====================================================
     LOAD CHAT
  ===================================================== */

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID is missing.");
      setLoading(false);
      return;
    }

    const loadChat = async () => {
      try {
        setError("");

        const response = await api.get(`/messages/booking/${bookingId}`);

        setMessages(response.data.messages || []);

        setBooking(response.data.booking || null);

        setService(response.data.service || null);

        setCustomer(response.data.customer || null);

        setProvider(response.data.provider || null);
      } catch (error) {
        console.error("LOAD CHAT ERROR:", error);

        setError(
          error.response?.data?.message || "Unable to load conversation.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [bookingId]);

  /* =====================================================
     SOCKET CONNECTION
  ===================================================== */

  useEffect(() => {
    if (!bookingId || !currentUserId) {
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Customer socket connected:", socket.id);

      setSocketConnected(true);

      socket.emit("joinConversation", {
        bookingId,
        userId: currentUserId,
      });
    });

    socket.on("conversationJoined", (data) => {
      console.log("Customer conversation joined:", data);
    });

    socket.on("receiveMessage", (newMessage) => {
      setMessages((previous) => {
        const exists = previous.some((item) => item._id === newMessage._id);

        if (exists) {
          return previous;
        }

        return [...previous, newMessage];
      });
    });

    socket.on("messageError", (data) => {
      console.error("Customer message error:", data);

      setError(data?.message || "Unable to send message.");

      setSending(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Customer socket connection error:", error);

      setSocketConnected(false);

      setError("Unable to connect to chat server.");
    });

    socket.on("disconnect", () => {
      console.log("Customer socket disconnected");

      setSocketConnected(false);
    });

    return () => {
      socket.disconnect();

      socketRef.current = null;

      setSocketConnected(false);
    };
  }, [bookingId, currentUserId]);

  /* =====================================================
     AUTO SCROLL
  ===================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const sendMessage = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!socketRef.current || !socketConnected) {
      setError("Chat server is not connected. Please wait a moment.");

      return;
    }

    if (!currentUserId) {
      setError("User information is missing. Please login again.");

      return;
    }

    setSending(true);

    setError("");

    socketRef.current.emit(
      "sendMessage",
      {
        bookingId,
        senderId: currentUserId,
        message: trimmedMessage,
      },
      (response) => {
        if (!response?.success) {
          setError(response?.message || "Unable to send message.");
        }

        setSending(false);
      },
    );

    setMessage("");
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="chat-page">
        <div className="sc-container">
          <div className="chat-loading-card">
            <div className="chat-loading-spinner"></div>

            <p>Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="chat-page">
      <div className="sc-container">
        {/* HEADER */}

        <div className="chat-page-header">
          <div>
            <p className="chat-eyebrow">PRIVATE CONVERSATION</p>

            <h1 className="chat-title">
              Chat with {provider?.user?.name || "Service Provider"}
            </h1>

            <p className="chat-subtitle">
              Discuss your service and booking details.
            </p>
          </div>

          <Link
            to={`/customer/bookings/${bookingId}`}
            className="chat-back-button"
          >
            ← Booking Details
          </Link>
        </div>

        {/* BOOKING */}

        <div className="chat-booking-card">
          <div className="chat-service-icon">🛠️</div>

          <div className="chat-booking-info">
            <span className="chat-booking-label">BOOKING</span>

            <h2>{service?.name || "Service"}</h2>

            <div className="chat-booking-meta">
              <span>
                📅{" "}
                {booking?.bookingDate
                  ? new Date(booking.bookingDate).toLocaleDateString()
                  : "N/A"}
              </span>

              <span>
                🕐 {booking?.timeSlot?.startTime || "--"} -{" "}
                {booking?.timeSlot?.endTime || "--"}
              </span>

              <span>₹{booking?.amount || 0}</span>
            </div>
          </div>

          <span className="chat-status">{booking?.status || "Unknown"}</span>
        </div>

        {/* CHAT */}

        <div className="chat-card">
          <div className="chat-card-header">
            <div className="chat-user-avatar">
              {provider?.user?.name?.charAt(0)?.toUpperCase() || "P"}
            </div>

            <div className="chat-user-info">
              <h2>{provider?.user?.name || "Service Provider"}</h2>

              <p>{service?.name || "SkillConnect Service"}</p>
            </div>

            <div
              className={`chat-connection ${
                socketConnected ? "chat-connected" : "chat-disconnected"
              }`}
            >
              <span></span>

              {socketConnected ? "Connected" : "Connecting..."}
            </div>
          </div>

          {/* ERROR */}

          {error && <div className="chat-error">⚠️ {error}</div>}

          {/* MESSAGES */}

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <div className="chat-empty-icon">💬</div>

                <h3>No messages yet</h3>

                <p>Start a conversation with your service provider.</p>

                <span>
                  Ask about the service, booking time or any special
                  requirements.
                </span>
              </div>
            ) : (
              messages.map((item, index) => {
                const senderId = item.sender?._id || item.sender;

                const isOwnMessage = String(senderId) === String(currentUserId);

                return (
                  <div
                    key={item._id || index}
                    className={`chat-message-row ${
                      isOwnMessage ? "chat-message-own" : "chat-message-other"
                    }`}
                  >
                    {!isOwnMessage && (
                      <div className="chat-small-avatar">
                        {item.sender?.name?.charAt(0)?.toUpperCase() || "P"}
                      </div>
                    )}

                    <div className="chat-message-wrapper">
                      {!isOwnMessage && (
                        <span className="chat-message-sender">
                          {item.sender?.name || "Service Provider"}
                        </span>
                      )}

                      <div
                        className={`chat-message ${
                          isOwnMessage
                            ? "chat-message-blue"
                            : "chat-message-white"
                        }`}
                      >
                        <p>{item.message}</p>

                        {item.createdAt && (
                          <span>
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}

          <form onSubmit={sendMessage} className="chat-input-area">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                socketConnected
                  ? "Type your message..."
                  : "Connecting to chat..."
              }
              disabled={!socketConnected || sending}
            />

            <button
              type="submit"
              disabled={!socketConnected || sending || !message.trim()}
            >
              {sending ? "Sending..." : "Send ➤"}
            </button>
          </form>

          <div className="chat-input-help">
            {socketConnected
              ? "Press Enter or click Send to send your message."
              : "Connecting to SkillConnect chat server..."}
          </div>
        </div>

        {/* INFO */}

        <div className="chat-info-grid">
          <div className="chat-info-card">
            <div className="chat-info-icon">🔒</div>

            <div>
              <h3>Private Conversation</h3>

              <p>
                Your conversation is private between you and the service
                provider.
              </p>
            </div>
          </div>

          <div className="chat-info-card">
            <div className="chat-info-icon">💡</div>

            <div>
              <h3>Need Help?</h3>

              <p>
                Discuss service requirements and booking details with your
                provider.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
